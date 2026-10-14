import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { MENU_ICONS, MENU_ICON_FALLBACK } from '../menu-icons';
import { MENU_DATA, MenuItem } from '../menu.data';

/** Icon colour for each top-level menu (by menu code). Menus not listed take the next colour in TONE_CYCLE. */
const MENU_TONES: Record<string, string> = {
  DASHBOARD: 'green',
  PLATFORM: 'slate',
  FR_RELATIONSHIPS: 'teal',
  FR_CAMPAIGNS: 'green',
  MN_DONATIONS: 'blue',
  COMMUNICATIONS: 'amber',
  ORGANISATION: 'olive',
  ADMINISTRATION: 'teal',
  MASTERS: 'sea'
};
const TONE_CYCLE = ['teal', 'green', 'blue', 'amber', 'olive', 'sea', 'slate'];

/** The sidebar heading each top-level menu sits under (by menu code). A menu's own `section` field wins;
    a menu not listed here joins the heading of the menu above it. */
const MENU_SECTIONS: Record<string, string> = {
  DASHBOARD: 'Workspace',
  SALES_RELATIONSHIPS: 'Sales & Relationships',
  PLATFORM: 'Platform',
  FR_RELATIONSHIPS: 'Fundraising',
  FR_CAMPAIGNS: 'Fundraising',
  MN_DONATIONS: 'Fundraising',
  COMMUNICATIONS: 'Fundraising',
  ORGANISATION: 'Administration',
  ADMINISTRATION: 'Administration',
  MASTERS: 'Administration'
};

/** One heading and the top-level menus under it. */
export interface MenuSection {
  label: string;
  items: MenuItem[];
}

/**
 * SIDEBAR - brand + menu built from the menu JSON (the same shape the API returns).
 *
 *   <app-sidebar />                      uses MENU_DATA (Shared/layout/menu.data.ts)
 *   <app-sidebar [menu]="apiMenu" />     uses the menu from the API
 *
 * Layout (sorted by displayOrder at every level):
 *   WORKSPACE                             a heading (MENU_SECTIONS / the menu's `section`); when a
 *                                         menu's name is its heading, its pages become the rows
 *   [icon] Dashboard                      a menu with a route and no children - a link
 *   [icon] Donors & Leads            v    a menu with children - opens / closes its pages
 *      |   Lead Work Queue                pages under a thin guide line, text only
 *      |   Organisations           >      a page with its own children opens one step deeper
 * Several menus can be open at once; the menu holding the current page opens by itself.
 * [collapsed]: an icon rail - icons only, names as tooltips; clicking a menu with pages expands it.
 * Links use the router (routerLink / routerLinkActive). Styles: sidebar.css.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  host: { '[class.is-collapsed]': 'collapsed()' }
})
export class Sidebar {
  /** The menu to show - defaults to the sample JSON; pass the API response instead. */
  readonly menu = input<MenuItem[]>(MENU_DATA);

  /** Collapsed to an icon rail (set by the top-bar toggle). */
  readonly collapsed = input(false);

  /** Asks the shell to expand the sidebar - sent when a menu with pages is clicked on the icon rail. */
  readonly expandRequest = output<void>();

  private readonly router = inject(Router);

  /** The current URL, kept up to date on every navigation. */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  /** Rows whose children are shown (by id). */
  private readonly expanded = signal<ReadonlySet<string>>(new Set());

  /** The top-level menus, in display order. */
  protected readonly items = computed(() => this.sorted(this.menu()));

  /** The menus grouped under their headings (WORKSPACE, SALES & RELATIONSHIPS …), in display order. */
  protected readonly sections = computed<MenuSection[]>(() => {
    const sections: MenuSection[] = [];
    for (const item of this.items()) {
      const label = item.section ?? MENU_SECTIONS[item.code] ?? sections.at(-1)?.label ?? 'Workspace';
      // a menu whose name IS its heading (Sales & Relationships, Platform): the heading replaces the
      // menu row and its pages show straight under it as icon rows - no duplicate name
      const rows = this.hasChildren(item) && this.same(label, item.name) ? this.sorted(item.children) : [item];
      const last = sections.at(-1);
      if (last && last.label === label) last.items.push(...rows);
      else sections.push({ label, items: rows });
    }
    return sections;
  });

  constructor() {
    // When the page changes, open every row that holds it.
    effect(() => {
      const parents = this.parentsOf(this.url());
      if (parents.length) {
        this.expanded.update((set) => new Set([...set, ...parents]));
      }
    });
  }

  // ---------------------------------------------------------------------------------------------
  // Used by sidebar.html
  // ---------------------------------------------------------------------------------------------

  /** The SVG path for an API icon name. */
  protected iconPath(name?: string): string {
    return (name && MENU_ICONS[name]) || MENU_ICON_FALLBACK;
  }

  /** The icon colour class for a top-level menu: tone-teal, tone-green … */
  protected toneOf(item: MenuItem): string {
    const tone = MENU_TONES[item.code] ?? TONE_CYCLE[Math.max(0, this.items().indexOf(item)) % TONE_CYCLE.length];
    return 'tone-' + tone;
  }

  /** The row has sub-items to show. */
  protected hasChildren(item: MenuItem): boolean {
    return item.children.length > 0;
  }

  /** The row's sub-items, in display order. */
  protected childrenOf(item: MenuItem): MenuItem[] {
    return this.sorted(item.children);
  }

  /** Show / hide the row's sub-items (several rows may be open together).
      On the icon rail, a click expands the sidebar and opens the row. */
  protected toggle(item: MenuItem, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    if (this.collapsed()) {
      this.expandRequest.emit();
      this.expanded.update((set) => new Set([...set, item.id]));
      return;
    }
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  protected isExpanded(item: MenuItem): boolean {
    return this.expanded().has(item.id);
  }

  /** A sub-item at any depth is the page on screen (the row is drawn a little stronger). */
  protected hasActiveChild(item: MenuItem): boolean {
    const url = this.url();
    const walk = (kids: readonly MenuItem[]): boolean =>
      kids.some((child) => this.matches(child, url) || walk(child.children));
    return walk(item.children);
  }

  /** A row with children and a route: the first click opens it, the next follows the link. */
  protected openOrGo(item: MenuItem, event: Event): void {
    if (this.hasChildren(item) && !this.isExpanded(item)) {
      this.toggle(item, event);
      return;
    }
    this.closeMobileMenu();
  }

  /** "_blank" for items that open in a new tab. */
  protected targetOf(item: MenuItem): string | null {
    return item.opensInNewTab ? '_blank' : null;
  }

  /** On a phone the sidebar is an overlay - close it once a page is chosen. */
  protected closeMobileMenu(): void {
    document.getElementById('sidebar')?.classList.remove('open');
  }

  // ---------------------------------------------------------------------------------------------

  private same(a: string, b: string): boolean {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }

  private sorted(items: readonly MenuItem[]): MenuItem[] {
    return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  private matches(item: MenuItem, url: string): boolean {
    const route = item.route;
    return !!route && (url === route || url.startsWith(route + '/') || url.startsWith(route + '?'));
  }

  /** Ids of every row that has a child (at any depth) matching the url. */
  private parentsOf(url: string): string[] {
    const found: string[] = [];
    const walk = (items: readonly MenuItem[]): boolean => {
      let hit = false;
      for (const item of items) {
        const childHit = walk(item.children);
        if (childHit) found.push(item.id);
        if (childHit || this.matches(item, url)) hit = true;
      }
      return hit;
    };
    walk(this.menu());
    return found;
  }
}