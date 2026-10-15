import { Injectable, signal } from '@angular/core';

export interface ThemePrefs {
  themeColor: string;
  secondaryColor: string;
  layout: 'vertical' | 'horizontal';
  menuFont: string;
  headingFont: string;
  numberFont: string;
  bodyFont: string;
  fontSize: number;
  fontWeight: 'light' | 'regular' | 'medium' | 'bold';
  lineHeight: number;
  mode: 'light' | 'dark';
  sidebarBg: string | null;
  iconColor: string;
  headingColor: string;
  shadow: number;
  borderRadius: number;
  buttonRadius: number;
  profileImage: number;
  customThemeColors: string[];
  customSecondaryColors: string[];
  customIconColors: string[];
  customHeadingColors: string[];
  palette: string | null;
  navDensity: 'comfortable' | 'compact';
}

export interface SidebarBgOption {
  label: string;
  value: string | null;
  tone: 'light' | 'dark';
}

export interface ProfileImageOption {
  label: string;
  src: string;
}

export interface ThemePalette {
  id: string;
  name: string;
  accent: string;
  hover: string;
  pressed: string;
}

export const THEME_COLORS: string[] = ['#c78028', '#bd4d53', '#7c3348', '#8763bd', '#138879', '#e0559b'];

export const SECONDARY_COLORS: string[] = ['#c78028', '#bd4d53', '#7c3348', '#4169c4', '#138879', '#232b3e'];

export const ICON_COLORS: string[] = ['#6a7083', '#c78028', '#bd4d53', '#138879', '#4169c4', '#232b3e'];

export const HEADING_COLORS: string[] = ['#202333', '#7c3348', '#138879', '#4169c4', '#e0559b'];

export const PALETTES: ThemePalette[] = [
  { id: 'classic', name: 'Original Navy & Teal', accent: '#087e8b', hover: '#066a75', pressed: '#075762' },
  { id: 'ocean', name: 'Blueberry & Slate', accent: '#2f3a55', hover: '#5c6b8a', pressed: '#6e6f73' },
  { id: 'sapphire', name: 'Lemon & Leaf', accent: '#2f4a1f', hover: '#f4c430', pressed: '#e0a91f' },
  { id: 'forest', name: 'Citrus & Cocoa', accent: '#4f1d02', hover: '#f3c01e', pressed: '#c49f6c' },
  { id: 'violet', name: 'Coastal Blue', accent: '#2f3d4d', hover: '#6d8fa3', pressed: '#93acaa' },
  { id: 'mineral', name: 'Mineral & Cocoa', accent: '#5b6f7f', hover: '#3e2a23', pressed: '#d8c9b5' },
  { id: 'scandinavian', name: 'Scandinavian Slate', accent: '#67707a', hover: '#7c7b72', pressed: '#2c2c2a' },
  { id: 'earth', name: 'Earth & Ocean', accent: '#5b6a73', hover: '#ae6139', pressed: '#887668' },
  { id: 'calm', name: 'Calm Forest', accent: '#15201c', hover: '#9a4e28', pressed: '#343635' }
];

export const paletteById = (id: string | null): ThemePalette | null =>
  (id && PALETTES.find((p) => p.id === id)) || null;

export const FONT_CHOICES: string[] = ['Inter', 'Roboto', 'Poppins', 'Nunito', 'Georgia', 'Times', 'Courier', 'Montserrat', 'Lato'];

export const FONT_SIZES: number[] = [12, 13, 14, 15, 16, 18];

export const FONT_WEIGHTS: { id: 'light' | 'regular' | 'medium' | 'bold'; label: string; value: number }[] = [
  { id: 'light', label: 'Light', value: 300 },
  { id: 'regular', label: 'Regular', value: 400 },
  { id: 'medium', label: 'Medium', value: 500 },
  { id: 'bold', label: 'Bold', value: 700 }
];


const svgUrl = (svg: string): string => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const bgImage = (svg: string, base: string): string => `${svgUrl(svg)} center / cover no-repeat, ${base}`;

const SIDE_OPEN = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 640' preserveAspectRatio='xMidYMid slice'>`;

const waves = (top: string, bottom: string, stroke: string, opacity: number): string => `${SIDE_OPEN}
  <defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
    <stop offset='0' stop-color='${top}'/><stop offset='1' stop-color='${bottom}'/>
  </linearGradient></defs>
  <rect width='240' height='640' fill='url(#g)'/>
  <g fill='none' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='1.2'>
    ${Array.from({ length: 10 }, (_, i) =>
      `<path d='M-20 ${300 + i * 26} C 50 ${255 + i * 26}, 150 ${360 + i * 26}, 260 ${295 + i * 26}'/>`).join('')}
  </g>
</svg>`;

const geo = (base: string, a: string, b: string, c: string): string => `${SIDE_OPEN}
  <rect width='240' height='640' fill='${base}'/>
  <polygon points='0,0 240,0 0,220' fill='${a}'/>
  <polygon points='240,0 240,300 60,160' fill='${b}' fill-opacity='.7'/>
  <polygon points='0,220 180,380 0,520' fill='${c}' fill-opacity='.45'/>
  <polygon points='240,300 240,640 90,520' fill='${a}' fill-opacity='.85'/>
  <polygon points='0,520 140,640 0,640' fill='${b}' fill-opacity='.6'/>
</svg>`;

const contour = (base: string, stroke: string, opacity: number): string => `${SIDE_OPEN}
  <rect width='240' height='640' fill='${base}'/>
  <g fill='none' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='1.1'>
    ${Array.from({ length: 11 }, (_, i) =>
      `<ellipse cx='70' cy='430' rx='${24 + i * 22}' ry='${16 + i * 17}'/>`).join('')}
  </g>
</svg>`;

const aurora = `${SIDE_OPEN}
  <defs><filter id='b' x='-50%' y='-50%' width='200%' height='200%'><feGaussianBlur stdDeviation='38'/></filter></defs>
  <rect width='240' height='640' fill='#130f26'/>
  <g filter='url(#b)'>
    <circle cx='40' cy='130' r='95' fill='#7b3fe4' fill-opacity='.85'/>
    <circle cx='210' cy='330' r='105' fill='#1fb5a5' fill-opacity='.7'/>
    <circle cx='60' cy='540' r='95' fill='#e0457b' fill-opacity='.65'/>
  </g>
</svg>`;

const sunset = `${SIDE_OPEN}
  <defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'>
    <stop offset='0' stop-color='#ff9f66'/><stop offset='.45' stop-color='#a8355e'/><stop offset='1' stop-color='#2a1540'/>
  </linearGradient></defs>
  <rect width='240' height='640' fill='url(#s)'/>
  <circle cx='165' cy='290' r='42' fill='#ffd9a3' fill-opacity='.8'/>
  <path d='M0 470 Q60 420 120 455 T240 440 V640 H0z' fill='#5a2150'/>
  <path d='M0 530 Q70 490 140 520 T240 510 V640 H0z' fill='#3a1840'/>
  <path d='M0 590 Q80 560 160 585 T240 580 V640 H0z' fill='#22102c'/>
</svg>`;

/** Sidebar backgrounds: "None" first, then light images, then dark images. */
export const SIDEBAR_BGS: SidebarBgOption[] = [
  { label: 'None', value: null, tone: 'light' },
  { label: 'Pearl', value: bgImage(waves('#f8f9fc', '#e9ecf3', '#b9c2d6', 0.55), '#eef0f5'), tone: 'light' },
  { label: 'Blush', value: bgImage(geo('#fbf1f4', '#f5dfe7', '#efd0dc', '#e6bccd'), '#f8e9ee'), tone: 'light' },
  { label: 'Mint', value: bgImage(contour('#eef8f4', '#8cc9b6', 0.5), '#eef8f4'), tone: 'light' },
  { label: 'Midnight', value: bgImage(waves('#1d2746', '#0c1120', '#4a5d9a', 0.45), '#0c1120'), tone: 'dark' },
  { label: 'Aurora', value: bgImage(aurora, '#130f26'), tone: 'dark' },
  { label: 'Maroon', value: bgImage(geo('#3a1424', '#5a1d33', '#7a2a45', '#9b3b5a'), '#3a1424'), tone: 'dark' },
  { label: 'Sunset', value: bgImage(sunset, '#2a1540'), tone: 'dark' }
];

const LEGACY_SIDEBAR_BGS: string[] = [
  'linear-gradient(180deg,#f6f7fa,#e8e9ee)',
  'linear-gradient(180deg,#fbf0f3,#f3dde5)',
  'radial-gradient(circle at 30% 12%, #e9f6f2, #d8ebe5)',
  'repeating-linear-gradient(135deg,#f6f7fa 0 10px,#edeff4 10px 20px)',
  'repeating-linear-gradient(0deg,#f6f7fa 0 12px,#eceef3 12px 13px)',
  'linear-gradient(180deg,#eef2fd,#dfe7f9)'
];

export const sidebarTone = (value: string | null): 'light' | 'dark' => {
  if (!value) return 'light';
  return SIDEBAR_BGS.find((b) => b.value === value)?.tone ?? 'dark';
};

const nature = (id: number): string => `https://picsum.photos/id/${id}/240/240`;

export const PROFILE_IMAGES: ProfileImageOption[] = [
  { label: 'Forest', src: nature(10) },
  { label: 'River', src: nature(15) },
  { label: 'Meadow', src: nature(17) },
  { label: 'Woods', src: nature(28) },
  { label: 'Peaks', src: nature(29) },
  { label: 'Valley', src: nature(1015) },
  { label: 'Canyon', src: nature(1016) },
  { label: 'Ridge', src: nature(1018) },
  { label: 'Snowfall', src: nature(1036) },
  { label: 'Waterfall', src: nature(1039) }
];

export const profileImageSrc = (index: number): string | null =>
  index >= 0 ? PROFILE_IMAGES[index]?.src ?? null : null;

export const THEME_DEFAULTS: ThemePrefs = {
  themeColor: '#7c3348',
  secondaryColor: '#c78028',
  layout: 'vertical',
  menuFont: 'Inter',
  headingFont: 'Inter',
  numberFont: 'Inter',
  bodyFont: 'Inter',
  fontSize: 13,
  fontWeight: 'regular',
  lineHeight: 1.5,
  mode: 'light',
  sidebarBg: null,
  iconColor: '#6a7083',
  headingColor: '#202333',
  shadow: 12,
  borderRadius: 13,
  buttonRadius: 8,
  profileImage: -1,
  customThemeColors: [],
  customSecondaryColors: [],
  customIconColors: [],
  customHeadingColors: [],
  palette: null,
  navDensity: 'comfortable'
};


const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));

export const tint = (hex: string, t: number): string => {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const num = Number.parseInt(full, 16);
  const mix = (ch: number): string => Math.round(ch + (255 - ch) * t).toString(16).padStart(2, '0');
  const r = mix((num >> 16) & 255);
  const g = mix((num >> 8) & 255);
  const b = mix(num & 255);
  return `#${r}${g}${b}`;
};

export const fontStack = (name: string): string => {
  if (name === 'Georgia') return 'Georgia, "Times New Roman", serif';
  if (name === 'Times') return '"Times New Roman", Times, serif';
  if (name === 'Courier') return '"Courier New", Courier, monospace';
  return `"${name}", Inter, "Segoe UI", Arial, sans-serif`;
};


export function applyTheme(prefs: ThemePrefs): void {
  const el = document.documentElement;
  const set = (k: string, v: string): void => el.style.setProperty(k, v);

  const palette = paletteById(prefs.palette);

  set('--accent', prefs.themeColor);
  set('--primary', prefs.themeColor);
  set('--accentbg', prefs.mode === 'dark' ? tint(prefs.themeColor, 0.78) : tint(prefs.themeColor, 0.92));

  // secondary accent -> --teal (drives .btn-secondary / success tones).
  // With an appearance palette active the secondary follows the palette's SECOND
  // tone (its hover strip) - distinct from the accent that drives the primary colour.
  // Without a palette it is the user's picked Secondary colour.
  set('--teal', palette ? palette.hover : prefs.secondaryColor);
  set('--icon-color', prefs.iconColor);
  set('--heading-color', prefs.headingColor);

  const favTile = prefs.mode === 'dark' ? tint(prefs.themeColor, 0.78) : tint(prefs.themeColor, 0.92);
  const favSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="15" fill="${favTile}"/>` +
    `<circle cx="32" cy="32" r="15" fill="none" stroke="${prefs.themeColor}" stroke-width="9"/></svg>`;
  const favLink = document.querySelector<HTMLLinkElement>('link[rel~="icon"]:not([rel~="alternate"])');
  if (favLink) favLink.href = `data:image/svg+xml,${encodeURIComponent(favSvg)}`;

  if (palette) {
    set('--theme-hover', palette.hover);
    set('--theme-press', palette.pressed);
  } else {
    el.style.removeProperty('--theme-hover');
    el.style.removeProperty('--theme-press');
  }

  // typography
  set('--font-body', fontStack(prefs.bodyFont));
  set('--font-menu', fontStack(prefs.menuFont));
  set('--font-heading', fontStack(prefs.headingFont));
  set('--font-number', fontStack(prefs.numberFont));
  set('--font-size', `${prefs.fontSize}px`);
  set('--font-weight', String(FONT_WEIGHTS.find((w) => w.id === prefs.fontWeight)?.value ?? 400));
  set('--line-height', String(prefs.lineHeight));

  // shape
  set('--radius', `${prefs.borderRadius}px`);
  set('--btn-radius', `${prefs.buttonRadius}px`);
  set('--shadow', `0 4px ${Math.round(prefs.shadow * 1.5)}px rgba(34,40,63,${clamp(prefs.shadow / 300, 0, 0.3).toFixed(3)})`);

  if (prefs.sidebarBg) set('--sidebar-bg', prefs.sidebarBg);
  else el.style.removeProperty('--sidebar-bg');

  el.dataset['sidebar'] = prefs.sidebarBg
    ? sidebarTone(prefs.sidebarBg)
    : prefs.mode === 'dark'
      ? 'dark'
      : 'light';

  // mode + layout + navigation spacing
  el.dataset['mode'] = prefs.mode;
  el.dataset['layout'] = prefs.layout;
  el.dataset['density'] = prefs.navDensity;
}

/* ---------- persistence ---------- */

const STORE_KEY = 'ydot-theme-settings';

function migrate(prefs: ThemePrefs): ThemePrefs {
  const next = { ...prefs };
  if (next.sidebarBg && LEGACY_SIDEBAR_BGS.includes(next.sidebarBg)) next.sidebarBg = null;
  if (next.profileImage >= PROFILE_IMAGES.length) next.profileImage = -1;
  next.customThemeColors = Array.isArray(next.customThemeColors) ? next.customThemeColors : [];
  next.customSecondaryColors = Array.isArray(next.customSecondaryColors) ? next.customSecondaryColors : [];
  next.customIconColors = Array.isArray(next.customIconColors) ? next.customIconColors : [];
  next.customHeadingColors = Array.isArray(next.customHeadingColors) ? next.customHeadingColors : [];
  if (!paletteById(next.palette)) next.palette = null;
  if (next.navDensity !== 'compact') next.navDensity = 'comfortable';
  return next;
}

export function loadTheme(): ThemePrefs {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return saved
      ? migrate({ ...THEME_DEFAULTS, ...(JSON.parse(saved) as Partial<ThemePrefs>) })
      : { ...THEME_DEFAULTS };
  } catch {
    return { ...THEME_DEFAULTS };
  }
}

export function saveTheme(prefs: ThemePrefs): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(prefs));
  } catch {
  }
}

/* ---------- the store every component reads ---------- */

@Injectable({ providedIn: 'root' })
export class ThemeSettingsService {
  readonly prefs = signal<ThemePrefs>(loadTheme());

  constructor() {
    applyTheme(this.prefs());
  }

  patch(partial: Partial<ThemePrefs>): void {
    const next = { ...this.prefs(), ...partial };
    this.prefs.set(next);
    applyTheme(next);
  }

  save(): void {
    saveTheme(this.prefs());
  }

  reset(): void {
    this.patch({ ...THEME_DEFAULTS });
  }
}