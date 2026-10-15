import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { MENU_ICONS, MENU_ICON_FALLBACK } from '../menu-icons';
import { MENU_DATA, MenuItem } from '../menu.data';

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

export interface MenuSection {
  label: string;
  items: MenuItem[];
}


@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  host: { '[class.is-collapsed]': 'collapsed()' }
})
export class Sidebar {
  readonly menu = input<MenuItem[]>(MENU_DATA);

  readonly collapsed = input(false);
  readonly expandRequest = output<void>();

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  private readonly expanded = signal<ReadonlySet<string>>(new Set());

  protected readonly items = computed(() => this.sorted(this.menu()));

  protected readonly sections = computed<MenuSection[]>(() => {
    const sections: MenuSection[] = [];
    for (const item of this.items()) {
      const label = item.section ?? MENU_SECTIONS[item.code] ?? sections.at(-1)?.label ?? 'Workspace';
      const rows = this.hasChildren(item) && this.same(label, item.name) ? this.sorted(item.children) : [item];
      const last = sections.at(-1);
      if (last && last.label === label) last.items.push(...rows);
      else sections.push({ label, items: rows });
    }
    return sections;
  });

  constructor() {
    effect(() => {
      const parents = this.parentsOf(this.url());
      if (parents.length) {
        this.expanded.update((set) => new Set([...set, ...parents]));
      }
    });
  }

  protected iconPath(name?: string): string {
    return (name && MENU_ICONS[name]) || MENU_ICON_FALLBACK;
  }

  protected toneOf(item: MenuItem): string {
    const tone = MENU_TONES[item.code] ?? TONE_CYCLE[Math.max(0, this.items().indexOf(item)) % TONE_CYCLE.length];
    return 'tone-' + tone;
  }

  protected hasChildren(item: MenuItem): boolean {
    return item.children.length > 0;
  }

  protected childrenOf(item: MenuItem): MenuItem[] {
    return this.sorted(item.children);
  }
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

  protected hasActiveChild(item: MenuItem): boolean {
    const url = this.url();
    const walk = (kids: readonly MenuItem[]): boolean =>
      kids.some((child) => this.matches(child, url) || walk(child.children));
    return walk(item.children);
  }

  protected openOrGo(item: MenuItem, event: Event): void {
    if (this.hasChildren(item) && !this.isExpanded(item)) {
      this.toggle(item, event);
      return;
    }
    this.closeMobileMenu();
  }

  protected targetOf(item: MenuItem): string | null {
    return item.opensInNewTab ? '_blank' : null;
  }

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