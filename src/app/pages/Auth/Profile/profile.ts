import { Component, computed, inject, signal } from '@angular/core';
import { ThemeSettings } from './settings';
import { ThemeSettingsService, profileImageSrc } from './theme-settings';

export interface InfoRow {
  icon: string;
  label: string;
  value: string | null;
}

export type ProfileTab = 'overview' | 'access' | 'security';

export interface StatCell {
  label: string;
  value: string;
  pill?: boolean;
  tone?: 'amber';
}

export interface AssignedRole {
  mark: string;
  name: string;
  note: string;
  scope: string;
  permissions: number;
  term: string;
}

export interface SecurityItem {
  icon: string;
  label: string;
  detail: string;
  status: string;
  tone: 'green' | 'amber';
}

const STATS: StatCell[] = [
  { label: 'Status', value: 'Active', pill: true },
  { label: 'Primary role', value: 'Platform Admin' },
  { label: 'Sign-in e-mail', value: 'vikram.anand@ngoplanet.test' },
  { label: 'Roles', value: '1 assigned' },
  { label: 'Two-step', value: 'Not Enrolled', tone: 'amber' },
  { label: 'Last sign-in', value: '10/15/2026, 9:16:43 AM' }
];

const TABS: { id: ProfileTab; label: string; meta: string }[] = [
  { id: 'overview', label: 'Overview', meta: '64%' },
  { id: 'access', label: 'Access', meta: '1' },
  { id: 'security', label: 'Security', meta: '2/3' }
];

const IDENTITY: InfoRow[] = [
  { icon: 'hash', label: 'Reference', value: 'PLT-001' },
  { icon: 'user', label: 'Display name', value: 'Vikram Anand' },
  { icon: 'target', label: 'Preferred name', value: null },
  { icon: 'card', label: 'Employee ID', value: null },
  { icon: 'at', label: 'Username', value: 'vikram.anand' },
  { icon: 'mail', label: 'E-mail', value: 'vikram.anand@ngoplanet.test' },
  { icon: 'phone', label: 'Mobile', value: '+91 9845012876' },
  { icon: 'globe', label: 'Language · timezone', value: 'en-IN · Asia/Kolkata' }
];

const ORGANISATION: InfoRow[] = [
  { icon: 'grid', label: 'Unit', value: null },
  { icon: 'users', label: 'Department', value: null },
  { icon: 'briefcase', label: 'Designation', value: 'Platform Operations Lead' },
  { icon: 'user-check', label: 'Manager', value: null },
  { icon: 'calendar', label: 'Joined', value: '10/14/2026' },
  { icon: 'layers', label: 'Data scopes', value: 'Whole organisation' }
];

const ROLES: AssignedRole[] = [
  { mark: 'P', name: 'Platform Admin', note: 'Primary assignment', scope: 'Whole organisation', permissions: 0, term: 'Permanent' }
];

const SECURITY: SecurityItem[] = [
  { icon: 'shield', label: 'Multi-factor', detail: 'No second factor', status: 'Not enrolled', tone: 'amber' },
  { icon: 'lock', label: 'Password', detail: 'Changed today', status: 'Current', tone: 'green' },
  { icon: 'alert', label: 'Lockout', detail: 'Can sign in normally', status: 'Clear', tone: 'green' }
];

/** Feather-style 24x24 line paths used by the page (same approach as the payments screen). */
const ICON_PATHS: Record<string, string> = {
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  check: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  hash: 'M4 9h16 M4 15h16 M10 3L8 21 M16 3l-2 18',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  card: 'M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22',
  at: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  briefcase: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  'user-check': 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M17 11l2 2 4-4',
  calendar: 'M8 2v4 M16 2v4 M3 10h18 M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z',
  layers: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
  sort: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
  key: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4',
  alert: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01',
  monitor: 'M20 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8 21h8 M12 17v4',
  arrow: 'M5 12h14 M12 5l7 7-7 7'
};

@Component({
  selector: 'app-profile',
  imports: [ThemeSettings],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  protected readonly stats = STATS;
  protected readonly tabs = TABS;
  protected readonly identity = IDENTITY;
  protected readonly organisation = ORGANISATION;
  protected readonly security = SECURITY;

  private readonly theme = inject(ThemeSettingsService);

  protected readonly settingsOpen = signal(false);

  /** Selected avatar image src, or null when initials are used. */
  protected readonly avatarSrc = computed<string | null>(
    () => profileImageSrc(this.theme.prefs().profileImage)
  );

  /** Same avatar as a CSS background value (kept for existing [style.background] bindings). */
  protected readonly avatarBg = computed<string | null>(() => {
    const src = this.avatarSrc();
    return src ? `url("${src}") center / cover no-repeat` : null;
  });

  protected readonly completeness = { filled: 9, total: 14, percent: 64 };

  readonly tab = signal<ProfileTab>('overview');

  readonly roleQuery = signal('');
  readonly roleSort = signal<'role' | 'scope'>('role');

  readonly visibleRoles = computed(() => {
    const q = this.roleQuery().trim().toLowerCase();
    const rows = ROLES.filter((r) => !q || [r.name, r.scope, r.note].some((v) => v.toLowerCase().includes(q)));
    const key = this.roleSort();
    return [...rows].sort((a, b) => (key === 'role' ? a.name.localeCompare(b.name) : a.scope.localeCompare(b.scope)));
  });

  setTab(tab: ProfileTab): void {
    this.tab.set(tab);
  }

  setRoleQuery(value: string): void {
    this.roleQuery.set(value);
  }

  setRoleSort(value: string): void {
    this.roleSort.set(value as 'role' | 'scope');
  }

  iconPath(name: string): string {
    return ICON_PATHS[name] ?? '';
  }

  postureArc(done: number, total: number): string {
    const deg = Math.round((done / total) * 360);
    return `conic-gradient(var(--orange) 0 ${deg}deg, #edeff3 ${deg}deg 360deg)`;
  }
}