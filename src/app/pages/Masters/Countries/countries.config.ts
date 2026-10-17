/* =====================================================================================================
   COUNTRIES - master configuration and sample rows
   Drives the countries list page (countries.html) and the create / edit page (country-form.html):
   table columns, filters, overview metrics, form sections with their rules, live preview and the
   view-drawer details. Sample rows are fictional review values; replace them with the API.
   ===================================================================================================== */
import {
  MasterConfig, statusMetrics, MasterRow, MasterStatus, REGIONS, STATUS_AI, STATUS_LABEL, dash, numOr, s, sortOrder, statusChoice, statusColumn, statusFilter, yesNo
} from '../../../Shared/Masters/masters.types';

const country = (
  code: string, alpha3: string, numeric: string, name: string, official: string, region: string,
  currency: string, phone: string, postal: string, subdivisions: boolean, sort: number
): MasterRow => ({
  id: 'cty-' + code, code, alpha2: code, alpha3, numeric, name, official, region, currency, phone,
  postal, subdivisions, status: 'active', sort
});

export const SEED_COUNTRIES: MasterRow[] = [
  country('IN', 'IND', '356', 'India', 'Republic of India', 'Asia', 'INR', '+91', '^[1-9][0-9]{5}$', true, 1),
  country('US', 'USA', '840', 'United States', 'United States of America', 'North America', 'USD', '+1', '^[0-9]{5}(-[0-9]{4})?$', true, 2),
  country('SG', 'SGP', '702', 'Singapore', 'Republic of Singapore', 'Asia', 'SGD', '+65', '^[0-9]{6}$', false, 3),
  country('AU', 'AUS', '036', 'Australia', 'Commonwealth of Australia', 'Oceania', 'AUD', '+61', '^[0-9]{4}$', true, 4),
  country('CA', 'CAN', '124', 'Canada', 'Canada', 'North America', 'CAD', '+1', '^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$', true, 5),
  country('GB', 'GBR', '826', 'United Kingdom', 'United Kingdom of Great Britain and Northern Ireland', 'Europe', 'GBP', '+44', '^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$', true, 6),
  country('DE', 'DEU', '276', 'Germany', 'Federal Republic of Germany', 'Europe', 'EUR', '+49', '^[0-9]{5}$', true, 7),
  country('FR', 'FRA', '250', 'France', 'French Republic', 'Europe', 'EUR', '+33', '^[0-9]{5}$', true, 8),
  country('JP', 'JPN', '392', 'Japan', 'Japan', 'Asia', 'JPY', '+81', '^[0-9]{3}-?[0-9]{4}$', true, 9),
  country('CN', 'CHN', '156', 'China', 'People’s Republic of China', 'Asia', 'CNY', '+86', '^[0-9]{6}$', true, 10),
  country('AE', 'ARE', '784', 'United Arab Emirates', 'United Arab Emirates', 'Middle East', 'AED', '+971', '', true, 11),
  { ...country('LK', 'LKA', '144', 'Sri Lanka', 'Democratic Socialist Republic of Sri Lanka', 'Asia', 'LKR', '+94', '^[0-9]{5}$', true, 12), status: 'inactive' }
];

export const COUNTRY: MasterConfig = {
  key: 'country',
  route: '/app/masters/country',
  plural: 'Countries',
  singular: 'country',
  eyebrow: 'Master data / Geography',
  subtitle: 'The nations used for addresses, dialling codes and default currencies across the workspace.',
  registerTitle: 'Nation registry',
  registerNote: 'Search, filter and maintain each country with its ISO codes.',
  icon: 'globe',
  searchLabel: 'Find a country',
  searchPlaceholder: 'Name, ISO code or region',
  searchKeys: ['name', 'official', 'alpha2', 'alpha3', 'region', 'currency'],
  filters: [
    { key: 'region', title: 'Region', allLabel: 'All regions', options: REGIONS, match: (r, v) => r['region'] === v },
    statusFilter(STATUS_AI)
  ],
  columns: [
    { key: 'name', label: 'Country', kind: 'lead', width: 26, code: (r) => s(r, 'alpha2'), sub: (r) => s(r, 'official'), sort: (r) => s(r, 'name') },
    { key: 'iso', label: 'ISO 2 / 3', kind: 'accent', width: 11, value: (r) => `${s(r, 'alpha2')} / ${s(r, 'alpha3')}`, sort: (r) => s(r, 'alpha2') },
    { key: 'region', label: 'Region', kind: 'text', width: 14, sort: (r) => s(r, 'region') },
    { key: 'phone', label: 'Dial code', kind: 'muted', width: 10, value: (r) => dash(s(r, 'phone')) },
    { key: 'currency', label: 'Currency', kind: 'chip', width: 11, sort: (r) => s(r, 'currency') },
    statusColumn
  ],
  defaultSort: { key: 'name', dir: 'asc' },
  metrics: (rows) => [
    { label: 'Countries', value: String(rows.length), note: 'In the registry' },
    ...statusMetrics(rows, 'countries', false),
    { label: 'Regions covered', value: String(new Set(rows.map((r) => r['region'])).size), note: 'Distinct world regions' }
  ],
  formTitle: 'New country',
  formSubtitle: 'Register a nation with its ISO 3166 codes, dialling prefix and default currency.',
  introTitle: 'Country register',
  introNote: 'Enter the identity, ISO standards and dialling details below.',
  codeKey: 'alpha2',
  nameKey: 'name',
  sections: [
    {
      no: '01', title: 'Identity', note: 'The familiar name and the formal name used on documents.',
      fields: [
        { key: 'name', label: 'Country name', kind: 'text', required: true, placeholder: 'India', maxlength: 80 },
        { key: 'official', label: 'Official name', kind: 'text', placeholder: 'Republic of India', maxlength: 120 },
        { key: 'region', label: 'Region', kind: 'select', required: true, options: REGIONS, placeholder: 'Select region' }
      ]
    },
    {
      no: '02', title: 'ISO standards', note: 'ISO 3166-1 codes identify the country; ISO 4217 its currency.',
      fields: [
        { key: 'alpha2', label: 'Alpha-2 code', hint: 'ISO 3166-1 · sets the flag tile', kind: 'text', required: true, upper: true, short: true, maxlength: 2, placeholder: 'IN', pattern: /^[A-Z]{2}$/, patternMsg: 'Use exactly 2 letters.', lockOnEdit: true },
        { key: 'alpha3', label: 'Alpha-3 code', hint: 'ISO 3166-1', kind: 'text', required: true, upper: true, short: true, maxlength: 3, placeholder: 'IND', pattern: /^[A-Z]{3}$/, patternMsg: 'Use exactly 3 letters.' },
        { key: 'numeric', label: 'Numeric code', hint: 'ISO 3166-1 · 3 digits', kind: 'text', short: true, maxlength: 3, placeholder: '356', pattern: /^[0-9]{3}$/, patternMsg: 'Use 3 digits, e.g. 036.' },
        { key: 'currency', label: 'Default currency', hint: 'ISO 4217', kind: 'select', required: true, optionsFrom: 'currencies', placeholder: 'Select currency' }
      ]
    },
    {
      no: '03', title: 'Address & dialling', note: 'Used to check phone numbers and postal codes on entry forms.',
      fields: [
        { key: 'phone', label: 'Phone code', hint: 'Country calling code', kind: 'text', short: true, maxlength: 5, placeholder: '+91', pattern: /^\+[0-9]{1,4}$/, patternMsg: 'Use + and 1–4 digits, e.g. +91.' },
        { key: 'postal', label: 'Postal code pattern', hint: 'Regular expression', kind: 'text', mono: true, regex: true, maxlength: 120, placeholder: '^[1-9][0-9]{5}$' },
        { key: 'subdivisions', label: 'States / provinces', kind: 'choice', options: yesNo('Has subdivisions', 'None') }
      ]
    },
    {
      no: '04', title: 'Status & order', note: 'Inactive countries stay on existing records but leave the dropdowns.',
      fields: [statusChoice(STATUS_AI), sortOrder]
    }
  ],
  defaults: { name: '', official: '', region: '', alpha2: '', alpha3: '', numeric: '', currency: '', phone: '', postal: '', subdivisions: 'yes', status: 'active', sort: '0' },
  preview: (v) => ({
    mark: v['alpha2'] || '··',
    title: v['name'] || 'Country name',
    sub: v['official'] || 'Official name',
    facts: [
      { label: 'ISO', value: v['alpha2'] || v['alpha3'] ? `${v['alpha2'] || '··'} / ${v['alpha3'] || '···'}` : '—' },
      { label: 'Dial', value: v['phone'] || '—' },
      { label: 'Currency', value: v['currency'] || '—' },
      { label: 'Status', value: STATUS_LABEL[(v['status'] || 'active') as MasterStatus], tone: v['status'] === 'active' ? 'ok' : 'muted' }
    ]
  }),
  toRow: (v, id) => ({
    id, code: v['alpha2'], alpha2: v['alpha2'], alpha3: v['alpha3'], numeric: v['numeric'], name: v['name'].trim(),
    official: v['official'].trim(), region: v['region'], currency: v['currency'], phone: v['phone'], postal: v['postal'],
    subdivisions: v['subdivisions'] === 'yes', status: v['status'], sort: numOr(v['sort'], 0)
  }),
  toForm: (r) => ({
    name: s(r, 'name'), official: s(r, 'official'), region: s(r, 'region'), alpha2: s(r, 'alpha2'), alpha3: s(r, 'alpha3'),
    numeric: s(r, 'numeric'), currency: s(r, 'currency'), phone: s(r, 'phone'), postal: s(r, 'postal'),
    subdivisions: r['subdivisions'] ? 'yes' : 'no', status: s(r, 'status'), sort: s(r, 'sort')
  }),
  details: (r) => [
    { label: 'Official name', value: dash(s(r, 'official')) },
    { label: 'Region', value: s(r, 'region') },
    { label: 'ISO alpha-2 / alpha-3', value: `${s(r, 'alpha2')} / ${s(r, 'alpha3')}` },
    { label: 'ISO numeric', value: dash(s(r, 'numeric')) },
    { label: 'Default currency', value: s(r, 'currency') },
    { label: 'Phone code', value: dash(s(r, 'phone')) },
    { label: 'Postal code pattern', value: dash(s(r, 'postal')) },
    { label: 'States / provinces', value: r['subdivisions'] ? 'Has subdivisions' : 'None' },
    { label: 'Sort order', value: s(r, 'sort') }
  ],
  footnote: 'ISO codes follow ISO 3166-1. The alpha-2 code is the stable reference and is locked after creation.'
};
