import { Component, HostListener, computed, inject, output } from '@angular/core';
import {
  FONT_CHOICES, FONT_SIZES, FONT_WEIGHTS, HEADING_COLORS, ICON_COLORS, PROFILE_IMAGES,
  SECONDARY_COLORS, SIDEBAR_BGS, THEME_COLORS, ThemePrefs, ThemeSettingsService, profileImageSrc
} from './theme-settings';

type SwatchKey = 'themeColor' | 'secondaryColor' | 'iconColor' | 'headingColor';

type IconName =
  | 'settings' | 'close' | 'palette' | 'droplet' | 'layout' | 'type' | 'size' | 'moon'
  | 'sidebar' | 'star' | 'heading' | 'shadow' | 'user' | 'upload' | 'check' | 'pen'
  | 'reset' | 'save' | 'sun' | 'rows' | 'columns' | 'ban';

interface FontGroup {
  key: 'menuFont' | 'headingFont' | 'numberFont' | 'bodyFont';
  label: string;
}

const ICONS: Record<IconName, string> = {
  settings: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  close: 'M6 6l12 12M18 6L6 18',
  palette: 'M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1.5 3.3A1.6 1.6 0 0 1 12 22zM7.5 11.5h.01M10.5 7.5h.01M15.5 8.5h.01',
  droplet: 'M12 2.7l5.7 5.7a8 8 0 1 1-11.4 0z',
  layout: 'M3 3h18v18H3zM3 9h18M9 21V9',
  type: 'M4 7V4h16v3M9 20h6M12 4v16',
  size: 'M3 7V5h10v2M8 5v14M6 19h4M14 13v-2h7v2M17.5 11v8M16 19h3',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  sidebar: 'M3 3h18v18H3zM9 3v18',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  heading: 'M6 4v16M18 4v16M6 12h12',
  shadow: 'M4 4h12v12H4zM8 20h12V8',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  check: 'M20 6L9 17l-5-5',
  pen: 'M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  reset: 'M1 4v6h6M3.5 15a9 9 0 1 0 2.1-9.4L1 10',
  save: 'M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4L12 14l-3-3',
  rows: 'M3 6h18M3 12h18M3 18h18',
  columns: 'M4 4h16v16H4zM9 4v16',
  ban: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM4.9 4.9l14.2 14.2'
};

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-theme-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class ThemeSettings {
  private readonly service = inject(ThemeSettingsService);

  readonly closed = output<void>();

  // ---- data from the store module ----
  // Base swatches + any custom colours the user picked (kept in prefs so they survive reload).
  protected readonly themeColors = computed(() => this.withCustom(THEME_COLORS, this.prefs().customThemeColors));
  protected readonly secondaryColors = computed(() => this.withCustom(SECONDARY_COLORS, this.prefs().customSecondaryColors));
  protected readonly iconColors = computed(() => this.withCustom(ICON_COLORS, this.prefs().customIconColors));
  protected readonly headingColors = computed(() => this.withCustom(HEADING_COLORS, this.prefs().customHeadingColors));
  protected readonly fonts = FONT_CHOICES;
  protected readonly sizes = FONT_SIZES;
  protected readonly weights = FONT_WEIGHTS;
  protected readonly sidebarBgs = SIDEBAR_BGS;
  protected readonly images = PROFILE_IMAGES;

  protected readonly fontGroups: FontGroup[] = [
    { key: 'menuFont', label: 'Menu font' },
    { key: 'headingFont', label: 'Heading font' },
    { key: 'numberFont', label: 'Number font' },
    { key: 'bodyFont', label: 'Other font' }
  ];

  protected readonly prefs = this.service.prefs;

  private saved: ThemePrefs = { ...this.service.prefs() };

  protected readonly dirty = computed(() => JSON.stringify(this.prefs()) !== JSON.stringify(this.saved));

  /** Sidebar background set from an uploaded file (not one of the presets). */
  protected readonly isCustomBg = computed(() => {
    const v = this.prefs().sidebarBg;
    return v !== null && !this.sidebarBgs.some((b) => b.value === v);
  });

  /** Selected avatar src for the live preview; null = initials. */
  protected readonly avatarSrc = computed(() => profileImageSrc(this.prefs().profileImage));

  // ---- helpers ----
  protected iconPath(name: IconName): string {
    return ICONS[name];
  }

  /** Base swatch list with the user's custom picks appended (newest last, de-duplicated). */
  private withCustom(base: string[], custom: readonly string[]): string[] {
    const extra = custom.filter((c) => !base.includes(c));
    return [...base, ...extra];
  }

  /** The prefs key holding the custom swatches for a colour row. */
  private customKeyFor(key: SwatchKey): keyof ThemePrefs {
    switch (key) {
      case 'themeColor': return 'customThemeColors';
      case 'secondaryColor': return 'customSecondaryColors';
      case 'iconColor': return 'customIconColors';
      case 'headingColor': return 'customHeadingColors';
    }
  }

  // ---- edits ----
  protected set<K extends keyof ThemePrefs>(key: K, value: ThemePrefs[K]): void {
    this.service.patch({ [key]: value } as Partial<ThemePrefs>);
  }

  /** Apply the colour; a non-preset pick is remembered in the custom swatch list (saved on Save). */
  protected setSwatch(key: SwatchKey, value: string): void {
    const base = this.baseFor(key);
    const patch: Record<string, unknown> = { [key]: value };

    // remember custom colours so they show up as swatches and survive a reload
    if (!base.includes(value)) {
      const customKey = this.customKeyFor(key);
      const current = (this.prefs()[customKey] as string[]) ?? [];
      const next = current.includes(value) ? current : [...current, value];
      patch[customKey] = next;
    }

    this.service.patch(patch as Partial<ThemePrefs>);
  }

  private baseFor(key: SwatchKey): string[] {
    switch (key) {
      case 'themeColor': return THEME_COLORS;
      case 'secondaryColor': return SECONDARY_COLORS;
      case 'iconColor': return ICON_COLORS;
      case 'headingColor': return HEADING_COLORS;
    }
  }

  /** Custom sidebar background from a local image file (max 2 MB). */
  protected uploadSidebarBg(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !file.type.startsWith('image/')) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      alert('Please choose an image under 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.set('sidebarBg', `url("${String(reader.result)}") center / cover no-repeat, #1e2228`);
    };
    reader.readAsDataURL(file);
  }

  /** Save the draft and close. */
  protected save(): void {
    this.service.save();
    this.saved = { ...this.service.prefs() };
    this.closed.emit();
  }

  protected reset(): void {
    this.service.reset();
  }

  protected close(): void {
    if (this.dirty()) this.service.patch(this.saved);
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}