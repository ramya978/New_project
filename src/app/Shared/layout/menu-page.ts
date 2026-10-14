import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

/**
 * Stand-in page for a menu link that has no real screen yet. app.routes.ts points every route in the
 * menu JSON here; replace a route's `component` with the real page when it is built.
 */
@Component({
  selector: 'app-menu-page',
  template: `
    <section class="card">
      <div class="card-head">
        <div>
          <h2>{{ name() }}</h2>
          <p>{{ route() }}</p>
        </div>
      </div>
      <div class="card-body">
        <p class="muted">This page is in the menu but its screen is not built yet.</p>
      </div>
    </section>
  `
})
export class MenuPage {
  private readonly active = inject(ActivatedRoute);
  private readonly data = toSignal(this.active.data, { initialValue: {} as Record<string, unknown> });

  protected readonly name = computed(() => String(this.data()['name'] ?? 'Page'));
  protected readonly route = computed(() => String(this.data()['route'] ?? ''));
}
