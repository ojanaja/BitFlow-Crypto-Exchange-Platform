import { Component } from '@angular/core';

@Component({
  selector: 'app-market-page',
  template: `
    <div class="w-full mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Markets</h1>
        <p class="text-slate-400 text-sm">
          Real-time crypto prices and market trends
        </p>
      </div>

      <!-- We reuse the existing dashboard market list, which is already a table -->
      <app-market-list></app-market-list>
    </div>
  `,
})
export class MarketPageComponent {}
