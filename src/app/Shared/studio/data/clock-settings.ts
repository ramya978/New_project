import { Injectable, computed, effect, signal } from '@angular/core';

/* =====================================================================================================
   WORKSPACE CLOCK SETTINGS - one shared store for the header clock (app.ts) and the
   Theme Settings → Workspace tab. Saved to localStorage as soon as anything changes.
   ===================================================================================================== */

/** A timezone the workspace clock can show. */
export interface ClockZone {
  /** IANA id, e.g. "Asia/Kolkata". */
  id: string;
  /** What the dropdown shows, e.g. "India · Kolkata". */
  label: string;
}

/** How the clock appears in the header. */
export type ClockPresentation = 'quiet' | 'detailed' | 'hidden';

export const CLOCK_ZONES: ClockZone[] = [
  { id: 'Asia/Kolkata', label: 'India · Kolkata' },
  { id: 'Asia/Dubai', label: 'United Arab Emirates · Dubai' },
  { id: 'Asia/Singapore', label: 'Singapore · Singapore' },
  { id: 'Asia/Tokyo', label: 'Japan · Tokyo' },
  { id: 'Australia/Sydney', label: 'Australia · Sydney' },
  { id: 'Europe/London', label: 'United Kingdom · London' },
  { id: 'Europe/Berlin', label: 'Germany · Berlin' },
  { id: 'America/New_York', label: 'United States · New York' },
  { id: 'America/Los_Angeles', label: 'United States · Los Angeles' },
  { id: 'UTC', label: 'Coordinated Universal Time · UTC' }
];

/** The city part of an IANA id ("America/New_York" -> "New York"). */
export const cityOf = (id: string): string => (id.split('/').pop() ?? id).replace(/_/g, ' ');

/** A zone the browser accepts, or null. */
export const validZone = (id: string | null | undefined): string | null => {
  if (!id) return null;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: id });
    return id;
  } catch {
    return null;
  }
};

interface ClockPrefs {
  zone: string;
  h12: boolean;
  seconds: boolean;
  paused: boolean;
  inHeader: boolean;
}

const CLOCK_KEY = 'ydot-clock';

const deviceZone = (): string => validZone(Intl.DateTimeFormat().resolvedOptions().timeZone) ?? 'UTC';

function readClockPrefs(): ClockPrefs {
  const fallback: ClockPrefs = { zone: deviceZone(), h12: true, seconds: false, paused: false, inHeader: true };
  try {
    const saved = JSON.parse(localStorage.getItem(CLOCK_KEY) ?? 'null') as Partial<ClockPrefs> | null;
    if (!saved) return fallback;
    return {
      zone: validZone(saved.zone) ?? fallback.zone,
      h12: saved.h12 ?? fallback.h12,
      seconds: saved.seconds ?? fallback.seconds,
      paused: saved.paused ?? fallback.paused,
      inHeader: saved.inHeader ?? fallback.inHeader
    };
  } catch {
    return fallback;
  }
}

/** The zone list, with the device's own zone added on top when it is not in the list. */
function buildZones(): ClockZone[] {
  const device = deviceZone();
  const list = [...CLOCK_ZONES];
  // "Asia/Calcutta" is the older name of "Asia/Kolkata"
  const known = (id: string) =>
    list.some((z) => z.id === id) || (id === 'Asia/Calcutta' && list.some((z) => z.id === 'Asia/Kolkata'));
  if (!known(device)) list.unshift({ id: device, label: 'This device · ' + cityOf(device) });
  return list;
}

@Injectable({ providedIn: 'root' })
export class ClockSettingsService {
  private readonly saved = readClockPrefs();

  /** Timezones offered in the clock dropdown. */
  readonly zones: ClockZone[] = buildZones();

  readonly zone = signal<ClockZone>(this.zoneById(this.saved.zone));
  readonly h12 = signal(this.saved.h12);
  readonly seconds = signal(this.saved.seconds);
  readonly paused = signal(this.saved.paused);
  readonly inHeader = signal(this.saved.inHeader);

  /** Quiet = minutes only · Detailed = with seconds · Hidden = not in the header. */
  readonly presentation = computed<ClockPresentation>(() =>
    !this.inHeader() ? 'hidden' : this.seconds() ? 'detailed' : 'quiet'
  );

  constructor() {
    // keep the clock settings between visits
    effect(() => {
      const prefs: ClockPrefs = {
        zone: this.zone().id,
        h12: this.h12(),
        seconds: this.seconds(),
        paused: this.paused(),
        inHeader: this.inHeader()
      };
      try {
        localStorage.setItem(CLOCK_KEY, JSON.stringify(prefs));
      } catch {
        // storage blocked - keep the in-memory settings
      }
    });
  }

  setPresentation(value: ClockPresentation): void {
    this.inHeader.set(value !== 'hidden');
    this.seconds.set(value === 'detailed');
  }

  zoneById(id: string): ClockZone {
    const wanted = id === 'Asia/Calcutta' ? 'Asia/Kolkata' : id;
    return this.zones.find((z) => z.id === wanted) ?? this.zones[0];
  }
}
