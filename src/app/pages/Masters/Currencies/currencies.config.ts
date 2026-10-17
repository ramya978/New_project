/* =====================================================================================================
   CURRENCIES - master configuration and sample rows
   Drives the currencies list page (currencies.html) and the create / edit page (currency-form.html):
   table columns, filters, overview metrics, form sections with their rules, live preview and the
   view-drawer details. Sample rows are fictional review values; replace them with the API.
   ===================================================================================================== */
import {
  CURRENCY_TYPES, MasterConfig, statusMetrics, MasterRow, MasterStatus, ROUNDING_MODES, STATUS_AD, STATUS_LABEL, dash, notes, numOr, s, sampleAmount, statusChoice, statusColumn, statusFilter
} from '../../../Shared/Masters/masters.types';

const currency = (
  code: string, name: string, numeric: string, symbol: string, decimals: number, minor: string,
  status: MasterStatus = 'active', position: 'prefix' | 'suffix' = 'prefix'
): MasterRow => ({
  id: 'cur-' + code, code, name, numeric, type: 'Fiat', symbol, symbolPosition: position,
  displayFormat: position === 'prefix' ? `${symbol}{amount}` : `{amount} ${symbol}`, decimals, minor,
  rounding: 'Half up', step: 'none', status, notes: ''
});

export const SEED_CURRENCIES: MasterRow[] = [
  currency('INR', 'Indian Rupee', '356', '₹', 2, 'Paise'),
  currency('USD', 'United States Dollar', '840', '$', 2, 'Cent'),
  currency('SGD', 'Singapore Dollar', '702', 'S$', 2, 'Cent'),
  currency('AED', 'United Arab Emirates Dirham', '784', 'د.إ', 2, 'Fils', 'active', 'suffix'),
  currency('GBP', 'Pound Sterling', '826', '£', 2, 'Penny'),
  currency('EUR', 'Euro', '978', '€', 2, 'Cent'),
  currency('CAD', 'Canadian Dollar', '124', 'C$', 2, 'Cent'),
  currency('AUD', 'Australian Dollar', '036', 'A$', 2, 'Cent'),
  currency('JPY', 'Japanese Yen', '392', '¥', 0, '—'),
  currency('CNY', 'Chinese Yuan', '156', '¥', 2, 'Fen'),
  currency('LKR', 'Sri Lankan Rupee', '144', 'Rs', 2, 'Cent', 'draft'),
  { ...currency('XAU', 'Gold (troy ounce)', '959', 'XAU', 4, '—', 'draft', 'suffix'), type: 'Commodity' }
];

export const CURRENCY: MasterConfig = {
  key: 'currency',
  route: '/app/masters/currency',
  plural: 'Currencies',
  singular: 'currency',
  eyebrow: 'Master data / Finance',
  subtitle: 'ISO 4217 currencies for billing and payments, with their symbol, decimals and rounding.',
  registerTitle: 'Currency register',
  registerNote: 'Decimals and rounding decide how every amount in that currency is stored and shown.',
  icon: 'coins',
  searchLabel: 'Find a currency',
  searchPlaceholder: 'Code, name or symbol',
  searchKeys: ['code', 'name', 'symbol', 'numeric'],
  filters: [
    { key: 'type', title: 'Type', allLabel: 'All types', options: CURRENCY_TYPES, match: (r, v) => r['type'] === v },
    statusFilter(STATUS_AD)
  ],
  columns: [
    { key: 'name', label: 'Currency', kind: 'lead', width: 28, code: (r) => s(r, 'code'), sub: (r) => `ISO 4217 · ${dash(s(r, 'numeric'))}`, sort: (r) => s(r, 'name') },
    { key: 'symbol', label: 'Symbol', kind: 'chip', width: 9, align: 'center' },
    { key: 'type', label: 'Type', kind: 'muted', width: 11, sort: (r) => s(r, 'type') },
    { key: 'decimals', label: 'Decimals', kind: 'num', width: 9, align: 'center', sort: (r) => Number(r['decimals']) },
    { key: 'sample', label: 'Shown as', kind: 'text', width: 14, value: (r) => sampleAmount({ decimals: s(r, 'decimals'), symbol: s(r, 'symbol'), symbolPosition: s(r, 'symbolPosition'), displayFormat: s(r, 'displayFormat') }) },
    statusColumn
  ],
  defaultSort: { key: 'name', dir: 'asc' },
  metrics: (rows) => [
    { label: 'Currencies', value: String(rows.length), note: 'In the register' },
    ...statusMetrics(rows, 'currencies'),
    { label: 'Zero-decimal', value: String(rows.filter((r) => Number(r['decimals']) === 0).length), note: 'Whole units only, e.g. JPY' }
  ],
  formTitle: 'New currency',
  formSubtitle: 'Add an ISO 4217 currency with its symbol, display format and rounding rule.',
  introTitle: 'Currency register',
  introNote: 'The preview shows 12,345.678 in the format you choose.',
  codeKey: 'code',
  nameKey: 'name',
  sections: [
    {
      no: '01', title: 'Identity', note: 'The ISO 4217 code and the name shown on documents.',
      fields: [
        { key: 'code', label: 'Currency code', hint: 'ISO 4217 · 3 letters', kind: 'text', required: true, upper: true, short: true, maxlength: 3, placeholder: 'INR', pattern: /^[A-Z]{3}$/, patternMsg: 'Use exactly 3 letters.', lockOnEdit: true },
        { key: 'name', label: 'Currency name', kind: 'text', required: true, maxlength: 80, placeholder: 'Indian Rupee' },
        { key: 'numeric', label: 'Numeric code', hint: 'ISO 4217 · 0–999', kind: 'text', short: true, maxlength: 3, placeholder: '356', pattern: /^[0-9]{3}$/, patternMsg: 'Use 3 digits, e.g. 356.' },
        { key: 'type', label: 'Currency type', kind: 'select', required: true, options: CURRENCY_TYPES, placeholder: 'Select currency type' }
      ]
    },
    {
      no: '02', title: 'Symbol & format', note: 'How an amount is written on screens, receipts and exports.',
      fields: [
        { key: 'symbol', label: 'Symbol', kind: 'text', short: true, maxlength: 4, placeholder: '₹' },
        { key: 'symbolPosition', label: 'Symbol position', kind: 'choice', required: true, options: [{ value: 'prefix', label: 'Prefix' }, { value: 'suffix', label: 'Suffix' }] },
        { key: 'displayFormat', label: 'Display format', hint: 'Use {amount}', kind: 'text', maxlength: 40, placeholder: '₹{amount}', mustInclude: '{amount}', wide: true }
      ]
    },
    {
      no: '03', title: 'Decimals & rounding', note: 'Amounts are stored in the minor unit; rounding applies to cash and conversions.',
      fields: [
        { key: 'decimals', label: 'Decimal places', hint: '2 for most · 0 for JPY', kind: 'choice', required: true, options: ['0', '1', '2', '3', '4'].map((d) => ({ value: d, label: d })) },
        { key: 'minor', label: 'Minor unit', kind: 'text', maxlength: 30, placeholder: 'Paise' },
        { key: 'rounding', label: 'Rounding mode', kind: 'select', required: true, options: ROUNDING_MODES, placeholder: 'Select rounding mode' },
        { key: 'step', label: 'Rounding step', hint: 'For cash rounding', kind: 'choice', options: ['none', '0.01', '0.05', '0.10', '1.00'].map((d) => ({ value: d, label: d === 'none' ? 'None' : d })) }
      ]
    },
    {
      no: '04', title: 'Status & notes', note: 'Drafts are kept out of payment forms until activated.',
      fields: [statusChoice(STATUS_AD), notes('currency')]
    }
  ],
  defaults: { code: '', name: '', numeric: '', type: '', symbol: '', symbolPosition: 'prefix', displayFormat: '', decimals: '2', minor: '', rounding: '', step: 'none', status: 'active', notes: '' },
  preview: (v) => ({
    mark: v['symbol'] || '¤',
    title: v['name'] || 'Currency name',
    sub: v['code'] || 'CODE',
    facts: [
      { label: 'Shown as', value: sampleAmount(v) },
      { label: 'Minor unit', value: v['minor'] || '—' },
      { label: 'Status', value: STATUS_LABEL[(v['status'] || 'active') as MasterStatus], tone: v['status'] === 'active' ? 'ok' : 'warn' }
    ]
  }),
  toRow: (v, id) => ({
    id, code: v['code'], name: v['name'].trim(), numeric: v['numeric'], type: v['type'], symbol: v['symbol'],
    symbolPosition: v['symbolPosition'], displayFormat: v['displayFormat'], decimals: numOr(v['decimals'], 2),
    minor: v['minor'], rounding: v['rounding'], step: v['step'], status: v['status'], notes: v['notes']
  }),
  toForm: (r) => ({
    code: s(r, 'code'), name: s(r, 'name'), numeric: s(r, 'numeric'), type: s(r, 'type'), symbol: s(r, 'symbol'),
    symbolPosition: s(r, 'symbolPosition') || 'prefix', displayFormat: s(r, 'displayFormat'), decimals: s(r, 'decimals'),
    minor: s(r, 'minor'), rounding: s(r, 'rounding'), step: s(r, 'step') || 'none', status: s(r, 'status'), notes: s(r, 'notes')
  }),
  details: (r) => [
    { label: 'ISO numeric', value: dash(s(r, 'numeric')) },
    { label: 'Type', value: s(r, 'type') },
    { label: 'Symbol', value: `${dash(s(r, 'symbol'))} · ${s(r, 'symbolPosition') === 'suffix' ? 'suffix' : 'prefix'}` },
    { label: 'Display format', value: dash(s(r, 'displayFormat')) },
    { label: 'Decimal places', value: s(r, 'decimals') },
    { label: 'Minor unit', value: dash(s(r, 'minor')) },
    { label: 'Rounding', value: `${s(r, 'rounding')}${s(r, 'step') && s(r, 'step') !== 'none' ? ' · step ' + s(r, 'step') : ''}` },
    { label: 'Notes', value: dash(s(r, 'notes')) }
  ],
  footnote: 'Codes follow ISO 4217. Amounts are calculated in the minor unit; displayed values are formatted copies.'
};
