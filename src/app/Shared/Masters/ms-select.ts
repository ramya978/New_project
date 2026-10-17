import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { Option } from './masters.types';

let nextId = 0;

/**
 * Custom dropdown (no native <select>): a button that opens a list panel, with a search box when
 * the list is long. Keyboard: ↓/↑ move, Enter selects, Esc closes, Home/End jump, typing searches.
 * Used by the list filters, the rows-per-page control and the create / edit forms.
 */
@Component({
  selector: 'ms-select',
  templateUrl: './ms-select.html',
  styleUrl: './ms-select.css',
  host: { '[class.is-open]': 'open()', '[class.is-compact]': 'compact()', '[class.is-disabled]': 'disabled()' }
})
export class MsSelect {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly value = input<string>('');
  readonly options = input<Option[]>([]);
  readonly placeholder = input<string>('Select');
  /** Adds a first "All …" option with the empty value (filters). */
  readonly allLabel = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly compact = input<boolean>(false);
  /** id for the button so a <label for> can point at it. */
  readonly inputId = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly describedBy = input<string | null>(null);
  /** Opens the panel above the button (rows-per-page at the bottom of a card). */
  readonly up = input<boolean>(false);

  readonly valueChange = output<string>();

  protected readonly uid = `ms-${++nextId}`;
  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly active = signal(0);

  protected readonly all = computed<Option[]>(() =>
    this.allLabel() ? [{ value: '', label: this.allLabel() }, ...this.options()] : this.options()
  );

  /** Search box only when it helps (long lists). */
  protected readonly searchable = computed(() => this.options().length > 7);

  protected readonly shown = computed<Option[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.all();
    return this.all().filter((o) => o.label.toLowerCase().includes(q) || (o.hint ?? '').toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
  });

  protected readonly selected = computed<Option | null>(() => this.all().find((o) => o.value === this.value()) ?? null);

  protected toggle(): void {
    if (this.disabled()) return;
    if (this.open()) this.close();
    else this.openPanel();
  }

  private openPanel(): void {
    this.query.set('');
    const i = this.all().findIndex((o) => o.value === this.value());
    this.active.set(Math.max(0, i));
    this.open.set(true);
    setTimeout(() => {
      const el = this.host.nativeElement;
      (el.querySelector<HTMLInputElement>('.ms-search input') ?? el.querySelector<HTMLElement>('.ms-list'))?.focus();
      this.scrollActive();
    });
  }

  protected close(refocus = true): void {
    if (!this.open()) return;
    this.open.set(false);
    if (refocus) setTimeout(() => this.host.nativeElement.querySelector<HTMLButtonElement>('.ms-trigger')?.focus());
  }

  protected pick(o: Option): void {
    this.close();
    if (o.value !== this.value()) this.valueChange.emit(o.value);
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
  }

  protected onTriggerKey(event: KeyboardEvent): void {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected onListKey(event: KeyboardEvent): void {
    const list = this.shown();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.active.set(Math.min(list.length - 1, this.active() + 1));
        this.scrollActive();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.active.set(Math.max(0, this.active() - 1));
        this.scrollActive();
        break;
      case 'Home':
        if ((event.target as HTMLElement).tagName === 'INPUT') return;
        event.preventDefault();
        this.active.set(0);
        this.scrollActive();
        break;
      case 'End':
        if ((event.target as HTMLElement).tagName === 'INPUT') return;
        event.preventDefault();
        this.active.set(list.length - 1);
        this.scrollActive();
        break;
      case 'Enter': {
        event.preventDefault();
        const o = list[this.active()];
        if (o) this.pick(o);
        break;
      }
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close();
        break;
      case 'Tab':
        this.close(false);
        break;
    }
  }

  private scrollActive(): void {
    setTimeout(() => this.host.nativeElement.querySelector('.ms-option.is-active')?.scrollIntoView({ block: 'nearest' }));
  }

  @HostListener('document:pointerdown', ['$event'])
  protected onDocPointer(event: PointerEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close(false);
  }
}
