import { Component, OnInit, OnDestroy } from '@angular/core';
import { MarketService } from '../../../../core/services/market.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-market-list',
  template: `
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
      <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <h3 class="font-bold text-white text-lg">Market Prices</h3>
        <div class="flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-xs text-emerald-500 font-medium">Live</span>
        </div>
      </div>
      
      <div class="overflow-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-950 sticky top-0 z-10">
            <tr class="text-slate-500 text-xs uppercase tracking-wider">
              <th class="py-3 px-4 font-semibold">Asset Pair</th>
              <th class="py-3 px-4 text-right font-semibold">Price</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr *ngFor="let coin of coins" class="group hover:bg-slate-800/60 transition-colors cursor-pointer">
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700 group-hover:border-violet-500/50 group-hover:text-violet-400 transition-colors">
                        {{ getCoinInitial(coin.name) | uppercase }}
                    </div>
                    <div>
                        <div class="font-bold text-slate-200 group-hover:text-white transition-colors">{{ coin.name | uppercase }}</div>
                        <div class="text-xs text-slate-500">USD</div>
                    </div>
                </div>
              </td>
              <td class="py-4 px-4 text-right">
                <div class="font-mono font-bold text-slate-200 text-base group-hover:text-emerald-400 transition-colors">{{ coin.price | currency:'USD':'symbol':'1.2-2' }}</div>
              </td>
            </tr>
             <tr *ngIf="coins.length === 0">
                <td colspan="2" class="text-center py-12">
                    <div class="flex flex-col items-center gap-3">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                        <span class="text-slate-500 text-sm">Connecting to feed...</span>
                    </div>
                </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class MarketListComponent implements OnInit, OnDestroy {
  coins: any[] = [];
  subscription!: Subscription;

  constructor(private marketService: MarketService) { }

  ngOnInit() {
    this.subscription = this.marketService.prices$.subscribe(prices => {
      this.coins = Object.keys(prices).map(key => ({
        name: key,
        price: prices[key]
      }));
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getCoinInitial(name: any): string {
    return name && typeof name === 'string' ? name.charAt(0) : '?';
  }
}
