import { Injectable, WritableSignal, computed, signal } from '@angular/core';
import { Lookup, MasterKey, MasterRow, MasterStatus, Option, OptionSource, fmtOffset } from './masters.types';
import { SEED_COUNTRIES } from '../../pages/Masters/Countries/countries.config';
import { SEED_STATES } from '../../pages/Masters/States/states.config';
import { SEED_CITIES } from '../../pages/Masters/Cities/cities.config';
import { SEED_CURRENCIES } from '../../pages/Masters/Currencies/currencies.config';
import { SEED_TIMEZONES } from '../../pages/Masters/Time_Zones/time-zones.config';

/** Last change, shown as a notice on the list page after a create / save / delete. */
export interface MasterNotice {
  key: MasterKey;
  text: string;
  tone: 'ok' | 'info';
}

/**
 * In-memory store for the five masters (one signal per master). The list and form pages read and
 * write through it, and dependent dropdowns (a state's country, a city's state, a country's currency)
 * are built from it, so a record created here appears in the other masters straight away.
 * Replace the seed + methods with API calls in production; the components only use this interface.
 */
@Injectable({ providedIn: 'root' })
export class MastersStore {
  private readonly data: Record<MasterKey, WritableSignal<MasterRow[]>> = {
    country: signal<MasterRow[]>(SEED_COUNTRIES.map((r) => ({ ...r }))),
    state: signal<MasterRow[]>(SEED_STATES.map((r) => ({ ...r }))),
    city: signal<MasterRow[]>(SEED_CITIES.map((r) => ({ ...r }))),
    currency: signal<MasterRow[]>(SEED_CURRENCIES.map((r) => ({ ...r }))),
    timezone: signal<MasterRow[]>(SEED_TIMEZONES.map((r) => ({ ...r })))
  };

  readonly notice = signal<MasterNotice | null>(null);

  rows(key: MasterKey): MasterRow[] {
    return this.data[key]();
  }

  find(key: MasterKey, id: string): MasterRow | null {
    return this.data[key]().find((r) => r.id === id) ?? null;
  }

  /** True when another record already uses this code (case-insensitive). */
  isDuplicate(key: MasterKey, field: string, value: string, exceptId: string | null, scope?: { field: string; value: string }): boolean {
    const v = value.trim().toLowerCase();
    if (!v) return false;
    return this.data[key]().some(
      (r) =>
        r.id !== exceptId &&
        String(r[field] ?? '').toLowerCase() === v &&
        (!scope || String(r[scope.field] ?? '') === scope.value)
    );
  }

  add(key: MasterKey, row: MasterRow): void {
    this.data[key].update((rows) => [row, ...rows]);
  }

  update(key: MasterKey, row: MasterRow): void {
    this.data[key].update((rows) => rows.map((r) => (r.id === row.id ? row : r)));
  }

  remove(key: MasterKey, id: string): void {
    this.data[key].update((rows) => rows.filter((r) => r.id !== id));
  }

  /** Power button: Active <-> Inactive (a draft becomes active). */
  toggleStatus(key: MasterKey, id: string): MasterStatus | null {
    let next: MasterStatus | null = null;
    this.data[key].update((rows) =>
      rows.map((r) => {
        if (r.id !== id) return r;
        next = r['status'] === 'active' ? 'inactive' : 'active';
        return { ...r, status: next };
      })
    );
    return next;
  }

  newId(key: MasterKey): string {
    return `${key}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  /* ---- dropdown sources (active records only, except the value already chosen) ---- */

  private readonly countryOptions = computed<Option[]>(() =>
    this.data.country()
      .filter((r) => r['status'] !== 'inactive')
      .sort((a, b) => String(a['name']).localeCompare(String(b['name'])))
      .map((r) => ({ value: String(r['alpha2']), label: String(r['name']), hint: String(r['alpha2']) }))
  );

  private readonly stateOptions = computed<(Option & { parent: string })[]>(() =>
    this.data.state()
      .filter((r) => r['status'] !== 'inactive')
      .sort((a, b) => String(a['name']).localeCompare(String(b['name'])))
      .map((r) => ({ value: String(r['code']), label: String(r['name']), hint: String(r['code']), parent: String(r['country']) }))
  );

  private readonly currencyOptions = computed<Option[]>(() =>
    this.data.currency()
      .filter((r) => r['status'] === 'active')
      .sort((a, b) => String(a['code']).localeCompare(String(b['code'])))
      .map((r) => ({ value: String(r['code']), label: `${r['code']} · ${r['name']}`, hint: String(r['symbol'] ?? '') }))
  );

  private readonly timezoneOptions = computed<Option[]>(() =>
    this.data.timezone()
      .filter((r) => r['status'] === 'active')
      .sort((a, b) => Number(b['recommended']) - Number(a['recommended']) || Number(a['offset']) - Number(b['offset']))
      .map((r) => ({ value: String(r['zone']), label: String(r['zone']), hint: 'UTC' + fmtOffset(Number(r['offset'])) }))
  );

  options(source: OptionSource, parent?: string): Option[] {
    switch (source) {
      case 'countries': return this.countryOptions();
      case 'currencies': return this.currencyOptions();
      case 'timezones': return this.timezoneOptions();
      case 'states': return this.stateOptions().filter((o) => !parent || o.parent === parent);
    }
  }

  /* ---- names for codes ---- */

  readonly lookup: Lookup = {
    countryName: (code: string) => String(this.data.country().find((r) => r['alpha2'] === code)?.['name'] ?? (code || '—')),
    /** "IN|TN" -> "Tamil Nadu" */
    stateName: (key: string) => {
      const [country, code] = key.split('|');
      return String(this.data.state().find((r) => r['country'] === country && r['code'] === code)?.['name'] ?? (code || '—'));
    }
  };
}
