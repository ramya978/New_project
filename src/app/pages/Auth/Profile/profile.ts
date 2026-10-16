import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ThemeSettings } from './settings';
import { ThemeSettingsService, profileImageSrc } from './theme-settings';

export type ProfileTab = 'overview' | 'access' | 'security';

/** One label / value line in the Identity or Organisation card ("null" = Not provided). */
export interface FieldRow {
  label: string;
  value: string | null;
  mono?: boolean;
}

export interface StatCell {
  icon: string;
  label: string;
  value: string;
  note?: string;
  tone?: 'amber';
}

export interface AssignedRole {
  name: string;
  note: string;
  scope: string;
  scopeNote: string;
  permissions: string;
  term: string;
}

export interface AssignmentStep {
  title: string;
  detail: string;
}

/** Security / session rows: right side is either a chip or an action button. */
export interface SecurityRow {
  icon: string;
  title: string;
  detail: string;
  extra?: string;
  chip?: string;
  chipTone?: 'neutral' | 'primary';
  action?: string;
}

const PROFILE = {
  name: 'Vikram Anand',
  initials: 'VA',
  designation: 'Platform Operations Lead',
  reference: 'PLT-001',
  organisation: 'Unity for Change',
  email: 'vikram.anand@example.test',
  primaryRole: 'Super admin',
  primaryRoleNote: 'Organisation-wide scope · sample'
};

const STATS: StatCell[] = [
  { icon: 'user', label: 'Profile completeness', value: '6 of 12 fields' },
  { icon: 'shield', label: 'Assigned roles', value: '1 role', note: '· illustrative' },
  { icon: 'lock', label: 'Two-step verification', value: 'Not enrolled', note: '· sample', tone: 'amber' },
  { icon: 'clock', label: 'Last sign-in · sample', value: '15 Oct 2026, 09:16', note: 'IST' }
];

const TABS: { id: ProfileTab; label: string; icon: string; count?: number }[] = [
  { id: 'overview', label: 'Overview', icon: 'user' },
  { id: 'access', label: 'Access', icon: 'shield', count: 1 },
  { id: 'security', label: 'Security', icon: 'lock' }
];

/** Identity & contact - left and right columns, read row by row. */
const IDENTITY_LEFT: FieldRow[] = [
  { label: 'Display name', value: 'Vikram Anand' },
  { label: 'Preferred name', value: null },
  { label: 'Employee ID', value: null },
  { label: 'Username', value: 'vikram.anand', mono: true }
];

const IDENTITY_RIGHT: FieldRow[] = [
  { label: 'Contact email', value: 'vikram.anand@example.test' },
  { label: 'Mobile number', value: null },
  { label: 'Language', value: 'English (India)' },
  { label: 'Time zone', value: 'Asia/Kolkata' }
];

const ORG_LEFT: FieldRow[] = [
  { label: 'Organisation', value: 'Unity for Change' },
  { label: 'Business unit', value: null },
  { label: 'Department', value: null }
];

const ORG_RIGHT: FieldRow[] = [
  { label: 'Designation', value: 'Platform Operations Lead' },
  { label: 'Reports to', value: null },
  { label: 'Joined on', value: '14 Oct 2026' }
];

const ROLES: AssignedRole[] = [
  {
    name: 'Super admin',
    note: 'Primary assignment',
    scope: 'Unity for Change',
    scopeNote: 'Whole organisation',
    permissions: 'Not loaded',
    term: 'Permanent · sample'
  }
];

const ASSIGNMENT_STEPS: AssignmentStep[] = [
  { title: 'Granted by an administrator', detail: 'Primary role assigned by the platform administrator · sample record.' },
  { title: 'Organisation-wide scope', detail: 'This example assignment covers Unity for Change. A separate assignment is needed for other organisations.' },
  { title: 'No end date', detail: 'Permanent assignment · sample. Ask an authorised administrator to review or change access.' }
];

const SIGN_IN_ROWS: SecurityRow[] = [
  { icon: 'mail', title: 'Sign-in email', detail: 'vikram.anand@example.test', chip: 'Managed identity' },
  { icon: 'shield', title: 'Two-step verification', detail: 'Not enrolled · sample. A second verification method adds protection at sign-in.', action: 'View setup steps' },
  { icon: 'lock', title: 'Password', detail: 'Password age and policy have not been loaded.', action: 'View password flow' },
  { icon: 'shield', title: 'Lockout state', detail: 'The account lockout status is currently unavailable.', chip: 'Not loaded' }
];

const SESSION_ROWS: SecurityRow[] = [
  { icon: 'devices', title: 'Desktop browser', detail: 'Windows · Chrome · sample device', extra: 'Started 15 Oct 2026, 09:16 IST', chip: 'Current · sample', chipTone: 'primary' },
  { icon: 'devices', title: 'Second browser session', detail: 'Same sample desktop · earlier sign-in', extra: 'Started 14 Oct 2026, 16:40 IST', action: 'View revoke flow' }
];

const PROTECT_TIPS = ['Use a second verification method', 'Store recovery codes securely', 'Review unfamiliar sessions'];

/** Feather-style 24x24 line paths used by the page. */
const ICON_PATHS: Record<string, string> = {
  appearance: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 2v20 M2 12h20',
  edit: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z',
  pencil: 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4 M12 15v3',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  building: 'M4 21V5l8-3 8 3v16 M2 21h20 M8 8h1 M15 8h1 M8 12h1 M15 12h1 M10 21v-5h4v5',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01',
  plus: 'M12 5v14 M5 12h14',
  tick: 'M20 6 9 17l-5-5',
  arrow: 'M5 12h14 M12 5l7 7-7 7',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
  devices: 'M3 4h13a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M6 18h7 M9.5 14v4 M18 9h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z'
};

@Component({
  selector: 'app-profile',
  imports: [NgTemplateOutlet, ThemeSettings],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  protected readonly profile = PROFILE;
  protected readonly stats = STATS;
  protected readonly tabs = TABS;
  protected readonly identityLeft = IDENTITY_LEFT;
  protected readonly identityRight = IDENTITY_RIGHT;
  protected readonly orgLeft = ORG_LEFT;
  protected readonly orgRight = ORG_RIGHT;
  protected readonly assignmentSteps = ASSIGNMENT_STEPS;
  protected readonly signInRows = SIGN_IN_ROWS;
  protected readonly sessionRows = SESSION_ROWS;
  protected readonly protectTips = PROTECT_TIPS;

  private readonly theme = inject(ThemeSettingsService);

  /** Appearance offcanvas (theme settings). */
  protected readonly settingsOpen = signal(false);

  /** Selected avatar image src, or null when initials are used. */
  protected readonly avatarSrc = computed<string | null>(
    () => profileImageSrc(this.theme.prefs().profileImage)
  );

  /** Same avatar as a CSS background value. */
  protected readonly avatarBg = computed<string | null>(() => {
    const src = this.avatarSrc();
    return src ? `url("${src}") center / cover no-repeat` : null;
  });

  /** Every profile field, used for the "Complete your profile" card. */
  private readonly allFields: FieldRow[] = [...IDENTITY_LEFT, ...IDENTITY_RIGHT, ...ORG_LEFT, ...ORG_RIGHT];

  protected readonly completeness = computed(() => {
    const total = this.allFields.length;
    const missing = this.allFields.filter((f) => f.value === null).map((f) => f.label);
    const filled = total - missing.length;
    return {
      filled,
      total,
      percent: Math.round((filled / total) * 100),
      shown: missing.slice(0, 4),
      more: Math.max(missing.length - 4, 0)
    };
  });

  readonly tab = signal<ProfileTab>('overview');

  readonly roleQuery = signal('');

  readonly visibleRoles = computed(() => {
    const q = this.roleQuery().trim().toLowerCase();
    return ROLES.filter((r) => !q || [r.name, r.note, r.scope, r.scopeNote].some((v) => v.toLowerCase().includes(q)));
  });

  setTab(tab: ProfileTab): void {
    this.tab.set(tab);
  }

  setRoleQuery(value: string): void {
    this.roleQuery.set(value);
  }

  /** Left and right columns zipped into rows, so both sides share one row height. */
  pairs(left: FieldRow[], right: FieldRow[]): [FieldRow | null, FieldRow | null][] {
    const n = Math.max(left.length, right.length);
    return Array.from({ length: n }, (_, i) => [left[i] ?? null, right[i] ?? null]);
  }

  iconPath(name: string): string {
    return ICON_PATHS[name] ?? '';
  }
}