import { AfterViewInit, Component, HostListener, NgZone, OnDestroy, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './Shared/layout/Sidebar/sidebar';

/** An organisation the user can act in (replace ORGANISATIONS with the API list). */
export interface Organisation {
  id: string;
  name: string;
  subdomain: string;
  status: 'Active' | 'Review only';
  mark: string;
}

/** A notification in the bell modal. */
interface Note {
  id: string;
  kind: 'Approvals' | 'Donations' | 'System';
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  tone: 'teal' | 'amber' | 'purple' | 'blue';
  glyph: string;
}

const ORGANISATIONS: Organisation[] = [
  { id: 'globalrelief', name: 'Global Relief Foundation', subdomain: 'globalrelief', status: 'Review only', mark: 'G' },
  { id: 'helpageindia', name: 'HelpAge India', subdomain: 'helpageindia', status: 'Active', mark: 'H' },
  { id: 'smilefoundation', name: 'Smile Foundation', subdomain: 'smilefoundation', status: 'Active', mark: 'S' },
  { id: 'unityforchange', name: 'Unity for Change', subdomain: 'unityforchange', status: 'Review only', mark: 'U' }
];

const NOTES: Note[] = [
  { id: 'n1', kind: 'Approvals', title: 'HelpAge India activated', detail: 'Organisation moved to Active · just now', time: 'now', unread: true, tone: 'teal', glyph: '✓' },
  { id: 'n2', kind: 'Approvals', title: '2 organisations await review', detail: 'Global Relief Foundation · Unity for Change', time: '1h', unread: true, tone: 'amber', glyph: '◷' },
  { id: 'n3', kind: 'Donations', title: 'Onboarding updated', detail: 'Smile Foundation documents verified', time: '2h', unread: false, tone: 'purple', glyph: '✎' },
  { id: 'n4', kind: 'System', title: 'Nightly audit finished', detail: 'No failures across 4 organisations', time: '1d', unread: false, tone: 'blue', glyph: '◈' }
];

const SIDEBAR_KEY = 'ydot-sidebar-collapsed';

const NOTE_FILTERS = ['All', 'Approvals', 'Donations', 'System'] as const;
type NoteFilter = (typeof NOTE_FILTERS)[number];

/**
 * App shell: the sidebar component, the top bar, the routed page and the studio.
 *
 * TOP BAR functions (used by app.html):
 *   toggleSidebar()            collapse / expand the sidebar (phone: open / close the menu overlay)
 *   toggleFullscreen()         enter / leave browser fullscreen
 *   toggleUserMenu()           open / close the account menu (closes on outside click and Esc)
 *   toggleOrgList()            open / close the organisation dropdown inside the account menu
 *   chooseOrg(org)             pick the organisation to act in
 *   openNotifications()        the bell modal; closeNotifications(), markAllRead()
 *
 * The studio engine renders the demonstration pages, modal and toast into the shell; it runs outside the
 * Angular zone because it owns its own DOM.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css',
  encapsulation: ViewEncapsulation.None
})
export class App {
  protected readonly title = signal('YDot Hotel Sales Studio');

  private readonly zone = inject(NgZone);

  // ---- sidebar ----------------------------------------------------------------------------------
  protected readonly sidebarCollapsed = signal(this.readCollapsed());

  // ---- account menu + organisation dropdown -----------------------------------------------------
  protected readonly userMenuOpen = signal(false);
  protected readonly orgListOpen = signal(false);
  protected readonly orgQuery = signal('');
  protected readonly organisations = signal<Organisation[]>(ORGANISATIONS);
  protected readonly selectedOrg = signal<Organisation | null>(null);
  protected readonly filteredOrgs = computed(() => {
    const q = this.orgQuery().trim().toLowerCase();
    const list = this.organisations();
    return q ? list.filter((o) => o.name.toLowerCase().includes(q) || o.subdomain.toLowerCase().includes(q)) : list;
  });

  // ---- notifications ----------------------------------------------------------------------------
  protected readonly notificationsOpen = signal(false);
  protected readonly notes = signal<Note[]>(NOTES);
  protected readonly noteFilters = NOTE_FILTERS;
  protected readonly noteFilter = signal<NoteFilter>('All');
  protected readonly visibleNotes = computed(() => {
    const f = this.noteFilter();
    return f === 'All' ? this.notes() : this.notes().filter((n) => n.kind === f);
  });
  protected readonly unreadCount = computed(() => this.notes().filter((n) => n.unread).length);

  // ---- fullscreen -------------------------------------------------------------------------------
  protected readonly isFullscreen = signal(false);

 
  // ---------------------------------------------------------------------------------------------
  // Sidebar
  // ---------------------------------------------------------------------------------------------

  /** Desktop: collapse to an icon rail / expand again. Phone (≤ 800px): open / close the overlay. */
  protected toggleSidebar(): void {
    if (window.matchMedia('(max-width: 800px)').matches) {
      document.getElementById('sidebar')?.classList.toggle('open');
      return;
    }
    this.setSidebarCollapsed(!this.sidebarCollapsed());
  }

  protected setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
    } catch {
      /* storage unavailable - the choice lasts for this visit */
    }
  }

  private readCollapsed(): boolean {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Fullscreen
  // ---------------------------------------------------------------------------------------------

  protected toggleFullscreen(): void {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  }

  @HostListener('document:fullscreenchange')
  protected onFullscreenChange(): void {
    this.isFullscreen.set(!!document.fullscreenElement);
  }

  // ---------------------------------------------------------------------------------------------
  // Account menu + organisation dropdown
  // ---------------------------------------------------------------------------------------------

  protected toggleUserMenu(event: Event): void {
    event.stopPropagation();
    const open = !this.userMenuOpen();
    this.userMenuOpen.set(open);
    if (!open) this.closeOrgList();
  }

  protected closeUserMenu(): void {
    this.userMenuOpen.set(false);
    this.closeOrgList();
  }

  /** The organisation box: opens a floating list under it (search on top), or closes it. */
  protected toggleOrgList(event: Event): void {
    event.stopPropagation();
    const open = !this.orgListOpen();
    this.orgListOpen.set(open);
    this.orgQuery.set('');
    if (open) {
      // focus the search once the list is drawn
      setTimeout(() => document.querySelector<HTMLInputElement>('.tb-org-pop input')?.focus());
    }
  }

  protected closeOrgList(): void {
    this.orgListOpen.set(false);
    this.orgQuery.set('');
  }

  /** Pick the organisation to act in. Call the switch-organisation API here. */
  protected chooseOrg(org: Organisation): void {
    this.selectedOrg.set(org);
    this.closeOrgList();
  }

  // ---------------------------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------------------------

  protected openNotifications(event: Event): void {
    event.stopPropagation();
    this.closeUserMenu();
    this.notificationsOpen.set(true);
  }

  protected closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  protected markAllRead(): void {
    this.notes.update((list) => list.map((n) => ({ ...n, unread: false })));
  }

  // ---------------------------------------------------------------------------------------------
  // Outside click / Esc
  // ---------------------------------------------------------------------------------------------

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (this.orgListOpen() && !target?.closest('.tb-org-wrap')) this.closeOrgList();
    if (this.userMenuOpen() && !target?.closest('.tb-account')) this.closeUserMenu();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.orgListOpen()) this.closeOrgList();
    else if (this.notificationsOpen()) this.closeNotifications();
    else this.closeUserMenu();
  }
}