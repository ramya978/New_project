import { Component, HostListener, computed, signal } from '@angular/core';

export type PaymentStatus = 'successful' | 'pending' | 'failed';

export interface ReceiptRow {

  ref: string;
  subRef: string | null;
  donor: string | null;
  email: string | null;
  /** Whole rupees. */
  amount: number;
  status: PaymentStatus;
  receivedAt: Date;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const fmtDate = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
};

export const inr = (n: number): string =>
  'INR ' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export const inrCompact = (n: number): string => '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const utc = (y: number, m: number, d: number, hh: number, mm: number) => Date.UTC(y, m - 1, d, hh, mm);

const FIRST_ROWS: ReceiptRow[] = [
  { ref: 'evt_CPLj3ZZ3Nsm8lV', subRef: 'INT-5BHBfHDB8EFR', donor: 'Sharmila Dipankar', email: 'sharmila.dipankar@mail.test', amount: 2000, status: 'pending', receivedAt: new Date(utc(2026, 10, 14, 21, 45)) },
  { ref: 'evt_zJo8CNh3fAXODy', subRef: 'INT-J9WXR9A5DAX4', donor: 'Kiran Manoj', email: 'kiran.manoj@mail.test', amount: 4500, status: 'pending', receivedAt: new Date(utc(2026, 10, 14, 21, 25)) },
  { ref: 'evt_donFLCgw81ePYP', subRef: 'INT-S77STPK4VQ9Q', donor: 'Ishita Rakesh', email: 'ishita.rakesh@mail.test', amount: 10000, status: 'pending', receivedAt: new Date(utc(2026, 10, 14, 20, 28)) },
  { ref: 'evt_Nvx3YUdYmpq2t0', subRef: null, donor: null, email: null, amount: 2500, status: 'pending', receivedAt: new Date(utc(2026, 10, 14, 19, 3)) },
  { ref: 'RCPT/2026-27/00072', subRef: 'RCPT/2026-27/00072', donor: 'Abhijit Tarun', email: 'abhijit.tarun@mail.test', amount: 12000, status: 'successful', receivedAt: new Date(utc(2026, 10, 14, 11, 59)) },
  { ref: 'RCPT/2026-27/00071', subRef: 'RCPT/2026-27/00071', donor: 'Santosh Vinay', email: 'santosh.vinay@mail.test', amount: 21000, status: 'successful', receivedAt: new Date(utc(2026, 10, 14, 10, 23)) },
  { ref: 'RCPT/2026-27/00070', subRef: 'RCPT/2026-27/00070', donor: 'Rahul Devraj', email: 'rahul.devraj@mail.test', amount: 9000, status: 'successful', receivedAt: new Date(utc(2026, 10, 14, 8, 38)) },
  { ref: 'RCPT/2026-27/00069', subRef: 'RCPT/2026-27/00069', donor: 'Ananya Sourav', email: 'ananya.sourav@mail.test', amount: 5000, status: 'successful', receivedAt: new Date(utc(2026, 10, 14, 8, 34)) },
  { ref: 'RCPT/2026-27/00068', subRef: 'RCPT/2026-27/00068', donor: 'Geetha Raman', email: 'geetha.raman@mail.test', amount: 5000, status: 'successful', receivedAt: new Date(utc(2026, 10, 13, 22, 37)) },
  { ref: 'RCPT/2026-27/00067', subRef: 'RCPT/2026-27/00067', donor: 'Payal Hitesh', email: 'payal.hitesh@mail.test', amount: 5000, status: 'successful', receivedAt: new Date(utc(2026, 10, 13, 19, 17)) }
];

const NAMES = [
  'Aarti Menon', 'Suresh Kumar', 'Vidya Balasubramanian', 'Nandini Iyer', 'Prakash Deshmukh',
  'Fatima Sheikh', 'Joseph Mathew', 'Lakshmi Narayanan', 'Arjun Pillai', 'Meera Krishnan',
  'Taranjit Singh', 'Divya Malhotra', 'Ramesh Chandra', 'Sneha Kulkarni', 'Anwar Hussain',
  'Ganesh Rao', 'Kavya Reddy', 'Milind Joshi', 'Pooja Sharma', 'Harish Nair',
  'Shruti Bose', 'Aditya Ghosh', 'Rekha Pandey', 'Sanjay Verma', 'Nithya Raghavan',
  'Arun Prakash', 'Bhavna Thakur', 'Imran Qureshi', 'Leela Menon', 'Sathish Kumar',
  'Ritu Agarwal', 'Deepak Sethi', 'Anjali Vora', 'Gopal Mishra', 'Sheela Thomas', 'Yogesh Patil'
];

const AMOUNT_POOL = [5000, 7500, 10000, 12000, 1500, 2100, 25000, 3000, 8000, 4500, 6000, 11000, 20000, 2500, 9000, 15000, 3500, 5000, 13000, 2000];

const TARGET_TOTAL = 2279400;
const COUNTS: Record<PaymentStatus, number> = { successful: 72, pending: 12, failed: 14 };

const seeded = (seed: number) => {
  let s = (seed * 2654435761) % 4294967296;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
};

const slug = (rnd: () => number, len: number, abc: string): string =>
  Array.from({ length: len }, () => abc[Math.floor(rnd() * abc.length)]).join('');

const buildRows = (): ReceiptRow[] => {
  const rows: ReceiptRow[] = [...FIRST_ROWS];
  const rnd = seeded(42);
  const statuses: PaymentStatus[] = [
    ...Array<PaymentStatus>(COUNTS.successful - 6).fill('successful'),
    ...Array<PaymentStatus>(COUNTS.pending - 4).fill('pending'),
    ...Array<PaymentStatus>(COUNTS.failed).fill('failed')
  ];
  for (let i = statuses.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [statuses[i], statuses[j]] = [statuses[j], statuses[i]];
  }
  let rcptNo = 66;
  const base = utc(2026, 10, 13, 19, 0);
  statuses.forEach((status, i) => {
    const name = NAMES[i % NAMES.length];
    const donor = i % 23 === 7 ? null : name;
    const amount = AMOUNT_POOL[i % AMOUNT_POOL.length];
    const receivedAt = new Date(base - (i + 1) * 3.1 * 3600 * 1000);
    if (status === 'successful') {
      const ref = `RCPT/2026-27/${String(rcptNo--).padStart(5, '0')}`;
      rows.push({ ref, subRef: ref, donor, email: donor ? name.toLowerCase().replace(/ /g, '.') + '@mail.test' : null, amount, status, receivedAt });
    } else {
      rows.push({
        ref: 'evt_' + slug(rnd, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'),
        subRef: 'INT-' + slug(rnd, 11, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'),
        donor,
        email: donor ? name.toLowerCase().replace(/ /g, '.') + '@mail.test' : null,
        amount,
        status,
        receivedAt
      });
    }
  });
  const generated = rows.slice(FIRST_ROWS.length);
  const diff = TARGET_TOTAL - rows.reduce((sum, r) => sum + r.amount, 0);
  const add = Math.floor(diff / generated.length / 100) * 100;
  generated.forEach((r) => (r.amount += add));
  generated[generated.length - 1].amount += diff - add * generated.length;
  return rows;
};

export const RECEIPTS: ReceiptRow[] = buildRows();

export interface StatCard {
  label: string;
  value: string;
  note: string;
  tone: 'ink' | 'accent' | 'teal' | 'blue' | 'red';
  icon: 'calendar' | 'rupee' | 'check' | 'clock' | 'x';
}

export const STATS: StatCard[] = [
  { label: 'Total events', value: String(RECEIPTS.length), note: 'In selected scope', tone: 'ink', icon: 'calendar' },
  { label: 'Total amount', value: inrCompact(RECEIPTS.reduce((s, r) => s + r.amount, 0)), note: 'In selected scope', tone: 'accent', icon: 'rupee' },
  { label: 'Successful', value: String(RECEIPTS.filter((r) => r.status === 'successful').length), note: 'Receipt sent', tone: 'teal', icon: 'check' },
  { label: 'Pending', value: String(RECEIPTS.filter((r) => r.status === 'pending').length), note: 'Awaiting payment', tone: 'blue', icon: 'clock' },
  { label: 'Failed', value: String(RECEIPTS.filter((r) => r.status === 'failed').length), note: 'Needs retry', tone: 'red', icon: 'x' }
];

const ICON_PATHS: Record<string, string> = {
  calendar: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M16 2v4 M8 2v4 M3 10h18',
  check: 'M20 6 9 17l-5-5',
  rupee: 'M6 3h12 M6 8h12 M6 13l8.5 8 M6 13h3 M9 13c6.667 0 6.667-10 0-10',
  clock: 'M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0 M12 6v6l4 2',
  'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3',
  x: 'M18 6 6 18 M6 6l12 12',
  search: 'M3 11a8 8 0 1 0 16 0 8 8 0 1 0-16 0 M21 21l-4.35-4.35',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'
};

const TONE_COLORS: Record<string, string> = {
  ink: 'var(--ink)',
  accent: 'var(--orange)',
  teal: 'var(--teal)',
  blue: 'var(--blue)',
  red: 'var(--red)'
};

@Component({
  selector: 'app-payments-receipts',
  templateUrl: './payments-receipts.html',
  styleUrl: './payments-receipts.css'
})
export class PaymentsReceipts {
  protected readonly inr = inr;
  protected readonly fmtDate = fmtDate;
  readonly query = signal('');
  readonly statusFilter = signal<'all' | PaymentStatus>('all');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly selected = signal<ReceiptRow | null>(null);

  readonly stats = STATS;
  readonly total = RECEIPTS.length;

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const status = this.statusFilter();
    return RECEIPTS.filter(
      (r) =>
        (status === 'all' || r.status === status) &&
        (!q ||
          [r.ref, r.subRef ?? '', r.donor ?? '', r.email ?? ''].some((v) => v.toLowerCase().includes(q)))
    );
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));

  readonly pageRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  readonly pages = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  readonly from = computed(() => (this.filtered().length === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.filtered().length));

  setQuery(value: string): void {
    this.query.set(value);
    this.page.set(1);
  }

  setStatus(value: string): void {
    this.statusFilter.set(value as 'all' | PaymentStatus);
    this.page.set(1);
  }

  setPageSize(value: string): void {
    this.pageSize.set(Number(value) || 10);
    this.page.set(1);
  }

  close(): void {
    this.selected.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  iconPath(name: string): string {
    return ICON_PATHS[name] ?? '';
  }

  toneColor(tone: string): string {
    return TONE_COLORS[tone] ?? TONE_COLORS['ink'];
  }

  /** Two-letter initials for the donor avatar ("Meera Iyer" -> "MI"). */
  initials(name: string | null): string {
    if (!name) return '—';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  /** Stable avatar colour per donor name. */
  avatarTone(name: string | null): string {
    if (!name) return 'av-none';
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
    return 'av-' + (h % 4);
  }

  /** Small grey line under the reference. */
  refNote(r: ReceiptRow): string {
    if (r.status === 'successful') return 'Receipt number';
    return r.subRef ? 'Intent · ' + r.subRef : 'No intent reference';
  }

  statusLabel(status: PaymentStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  statusIcon(status: PaymentStatus): string {
    return status === 'successful' ? 'check-circle' : status === 'pending' ? 'clock' : 'x';
  }

  badgeTone(status: PaymentStatus): string {
    return status === 'successful' ? 'teal' : status === 'pending' ? 'amber' : 'red';
  }

  receiptTitle(status: PaymentStatus): string {
    return status === 'successful' ? 'Receipt issued' : 'Not issued';
  }

  receiptSub(status: PaymentStatus): string {
    return status === 'successful'
      ? 'Sent to the donor e-mail'
      : status === 'pending'
        ? 'Awaiting payment confirmation'
        : 'Payment failed · retry required';
  }

  receiptNote(status: PaymentStatus): string {
    return status === 'successful'
      ? 'Issued and sent to the donor'
      : status === 'pending'
        ? 'Not issued yet - awaiting payment'
        : 'Not issued - payment failed, retry required';
  }
}