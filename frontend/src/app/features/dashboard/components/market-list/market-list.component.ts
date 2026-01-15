import { Component, OnInit, OnDestroy } from '@angular/core';
import { MarketService } from '../../../../core/services/market.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-market-list',
  template: `
    <div
      class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col"
    >
      <div
        class="flex items-center justify-between p-4 border-b border-slate-200 bg-white/90 backdrop-blur"
      >
        <h3 class="font-bold text-slate-900 text-lg">Market Prices</h3>
        <div class="flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
            ></span>
          </span>
          <span class="text-xs text-emerald-600 font-medium">Live</span>
        </div>
      </div>

      <div class="overflow-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 sticky top-0 z-10">
            <tr class="text-slate-500 text-xs uppercase tracking-wider">
              <th class="py-3 px-4 w-10"></th>
              <!-- Star Column -->

              <th
                (click)="toggleSort('name')"
                class="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 transition-colors group select-none"
              >
                <div class="flex items-center gap-1">
                  Asset Pair
                  <span
                    class="text-[10px] flex flex-col -space-y-1"
                    [class.opacity-100]="sortColumn === 'name'"
                    [class.opacity-30]="sortColumn !== 'name'"
                  >
                    <span
                      [class.text-emerald-500]="
                        sortColumn === 'name' && sortDirection === 'asc'
                      "
                      >▲</span
                    >
                    <span
                      [class.text-emerald-500]="
                        sortColumn === 'name' && sortDirection === 'desc'
                      "
                      >▼</span
                    >
                  </span>
                </div>
              </th>

              <th
                (click)="toggleSort('price')"
                class="py-3 px-4 text-right font-semibold cursor-pointer hover:text-slate-900 transition-colors group select-none"
              >
                <div class="flex items-center justify-end gap-1">
                  Price
                  <span
                    class="text-[10px] flex flex-col -space-y-1"
                    [class.opacity-100]="sortColumn === 'price'"
                    [class.opacity-30]="sortColumn !== 'price'"
                  >
                    <span
                      [class.text-emerald-500]="
                        sortColumn === 'price' && sortDirection === 'asc'
                      "
                      >▲</span
                    >
                    <span
                      [class.text-emerald-500]="
                        sortColumn === 'price' && sortDirection === 'desc'
                      "
                      >▼</span
                    >
                  </span>
                </div>
              </th>

              <th
                (click)="toggleSort('volume')"
                class="py-3 px-4 text-right font-semibold cursor-pointer hover:text-slate-900 transition-colors group select-none hidden md:table-cell"
              >
                <div class="flex items-center justify-end gap-1">
                  Volume (24h)
                  <span
                    class="text-[10px] flex flex-col -space-y-1"
                    [class.opacity-100]="sortColumn === 'volume'"
                    [class.opacity-30]="sortColumn !== 'volume'"
                  >
                    <span
                      [class.text-emerald-500]="
                        sortColumn === 'volume' && sortDirection === 'asc'
                      "
                      >▲</span
                    >
                    <span
                      [class.text-emerald-500]="
                        sortColumn === 'volume' && sortDirection === 'desc'
                      "
                      >▼</span
                    >
                  </span>
                </div>
              </th>

              <th
                (click)="toggleSort('change')"
                class="py-3 px-4 text-right font-semibold cursor-pointer hover:text-slate-900 transition-colors group select-none"
              >
                <div class="flex items-center justify-end gap-1">
                  Change
                  <span
                    class="text-[10px] flex flex-col -space-y-1"
                    [class.opacity-100]="sortColumn === 'change'"
                    [class.opacity-30]="sortColumn !== 'change'"
                  >
                    <span
                      [class.text-emerald-500]="
                        sortColumn === 'change' && sortDirection === 'asc'
                      "
                      >▲</span
                    >
                    <span
                      [class.text-emerald-500]="
                        sortColumn === 'change' && sortDirection === 'desc'
                      "
                      >▼</span
                    >
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              *ngFor="let coin of coins"
              (click)="navigateToTrade(coin.name)"
              class="group hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <td class="py-4 px-4">
                <button
                  (click)="toggleWatchlist($event, coin)"
                  class="text-slate-400 hover:text-yellow-400 transition-colors focus:outline-none"
                >
                  <svg
                    *ngIf="isInWatchlist(coin)"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-5 h-5 text-yellow-400"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <svg
                    *ngIf="!isInWatchlist(coin)"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.563.045.796.799.37 1.155l-4.223 3.541a.563.563 0 00-.171.554l1.298 5.418c.15.627-.52 1.173-1.054.858l-4.729-2.823a.564.564 0 00-.59 0l-4.73 2.823c-.535.316-1.205-.23-1.054-.858l1.298-5.418a.563.563 0 00-.17-.554l-4.223-3.541c-.426-.356-.192-1.11.37-1.155l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </button>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <div class="relative w-8 h-8 flex-shrink-0">
                    <!-- Image Icon -->
                    <img
                      [src]="
                        'https://assets.coincap.io/assets/icons/' +
                        (
                          coin.imageKey ||
                          coin.symbol ||
                          coin.name
                        ).toLowerCase() +
                        '@2x.png'
                      "
                      (error)="coin.imageError = true"
                      [class.hidden]="coin.imageError"
                      class="w-8 h-8 rounded-full"
                      alt="{{ coin.name }}"
                    />

                    <!-- Fallback Text Icon (shown only if image errors) -->
                    <div
                      *ngIf="coin.imageError"
                      class="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200"
                    >
                      {{ getCoinSymbol(coin.name) }}
                    </div>
                  </div>
                  <div>
                    <div
                      class="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors"
                    >
                      {{ coin.name | uppercase }}
                    </div>
                    <div class="text-xs text-slate-500">USD</div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4 text-right">
                <div
                  class="font-mono font-bold text-slate-700 text-base group-hover:text-emerald-600 transition-colors"
                >
                  {{ coin.price | currency : 'USD' : 'symbol' : '1.2-2' }}
                </div>
              </td>
              <td class="py-4 px-4 text-right hidden md:table-cell">
                <div class="font-mono text-sm text-slate-500">
                  {{ coin.volume | currency : 'USD' : 'symbol' : '1.0-0' }}
                </div>
              </td>
              <td class="py-4 px-4 text-right">
                <div
                  [class.text-emerald-500]="coin.change >= 0"
                  [class.text-rose-500]="coin.change < 0"
                  class="font-mono text-sm font-medium"
                >
                  {{ coin.change >= 0 ? '+' : ''
                  }}{{ coin.change | number : '1.2-2' }}%
                </div>
              </td>
            </tr>
            <tr *ngIf="coins.length === 0">
              <td colspan="4" class="text-center py-12">
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"
                  ></div>
                  <span class="text-slate-500 text-sm"
                    >Connecting to feed...</span
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class MarketListComponent implements OnInit, OnDestroy {
  coins: any[] = [];
  watchlist: string[] = [];
  subscription!: Subscription;
  watchlistSubscription!: Subscription;

  sortColumn: string = 'marketCapUsd';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private marketService: MarketService, private router: Router) {}

  ngOnInit() {
    this.subscription = this.marketService.allMarkets$.subscribe((markets) => {
      const mapped = markets.map((coin) => ({
        ...coin,
        imageError: false,
      }));
      this.coins = this.sortData(mapped);
    });

    this.watchlistSubscription = this.marketService.watchlist$.subscribe(
      (list) => {
        this.watchlist = list;
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.watchlistSubscription) {
      this.watchlistSubscription.unsubscribe();
    }
  }

  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
      if (column === 'name') this.sortDirection = 'asc';
    }
    this.coins = this.sortData(this.coins);
  }

  sortData(data: any[]) {
    return [...data].sort((a, b) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      if (
        [
          'priceUsd',
          'volumeUsd24Hr',
          'changePercent24Hr',
          'marketCapUsd',
        ].includes(this.sortColumn)
      ) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      if (this.sortColumn === 'name') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  toggleWatchlist(event: Event, coin: any) {
    event.stopPropagation();
    this.marketService.toggleWatchlist(coin.id || coin.name);
  }

  isInWatchlist(coin: any): boolean {
    return this.watchlist.includes((coin.id || coin.name).toLowerCase());
  }

  readonly COIN_SYMBOLS: { [key: string]: string } = {
    bitcoin: 'BTC',
    ethereum: 'ETH',
    solana: 'SOL',
    cardano: 'ADA',
    ripple: 'XRP',
    dogecoin: 'DOGE',
    polkadot: 'DOT',
    chainlink: 'LINK',
    litecoin: 'LTC',
  };

  getCoinSymbol(name: any): string {
    if (!name || typeof name !== 'string') return '?';
    return (
      this.COIN_SYMBOLS[name.toLowerCase()] ||
      name.substring(0, 3).toUpperCase()
    );
  }

  navigateToTrade(symbol: string) {
    this.router.navigate(['/dashboard/trade', symbol.toLowerCase()]);
  }
}
