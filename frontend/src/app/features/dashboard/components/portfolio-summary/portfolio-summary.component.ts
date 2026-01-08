import { Component, OnInit, OnDestroy } from '@angular/core';
import { WalletService } from '../../../../core/services/wallet.service';
import { MarketService } from '../../../../core/services/market.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-portfolio-summary',
  template: `
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      <!-- Background Glow -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div class="flex items-center justify-between mb-6 relative">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <span>Portfolio Value</span>
        </h2>
        <span class="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-400">USD</span>
      </div>

      <div class="mb-8 relative">
        <div class="text-4xl font-mono font-bold text-white tracking-tight flex items-baseline gap-1">
            <span class="text-emerald-400">$</span>
            {{ totalValue | number:'1.2-2' }}
        </div>
        <div class="text-sm text-emerald-500/80 mt-2 font-medium flex items-center gap-1">
            <span>~ {{ totalValueBtc | number:'1.4-4' }} BTC</span>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Your Assets</h3>
        
        <div *ngIf="assets.length > 0; else noAssets" class="space-y-3">
            <div *ngFor="let asset of assets" class="group flex justify-between items-center p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all duration-200">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:bg-violet-600/20 group-hover:text-violet-300 transition-colors">
                        {{ asset.symbol.substring(0,1) }}
                    </div>
                    <div>
                        <div class="font-bold text-slate-200">{{ asset.symbol }}</div>
                        <div class="text-xs text-slate-500">{{ asset.symbol === 'USD' ? 'Fiat Currency' : 'Crypto Asset' }}</div>
                    </div>
                </div>
                <!-- Right Side -->
                <div class="flex items-center gap-4">
                    <div class="text-right">
                        <div class="font-mono font-bold text-slate-200">{{ asset.quantity | number:'1.2-6' }}</div>
                        <div class="text-xs text-slate-500">~ {{ getAssetValue(asset) | currency:'USD' }}</div>
                    </div>
                    <!-- Trade Action -->
                    <button *ngIf="asset.symbol !== 'USD'" 
                        (click)="navigateToTrade(asset.symbol)"
                        class="p-2 rounded-lg bg-slate-700 hover:bg-violet-600 text-slate-300 hover:text-white transition-colors" matTooltip="Trade {{asset.symbol}}">
                        <mat-icon class="text-sm !w-4 !h-4 flex items-center justify-center">candlestick_chart</mat-icon>
                    </button>
                    <!-- Deposit Action for USD -->
                    <button *ngIf="asset.symbol === 'USD'" 
                        class="px-3 py-1 rounded bg-emerald-600/20 text-emerald-400 text-xs font-bold border border-emerald-600/30 cursor-default">
                        Main
                    </button>
                </div>
            </div>
        </div>
        
        <ng-template #noAssets>
            <div class="text-center py-8 border-2 border-dashed border-slate-800 rounded-lg">
                <div class="text-slate-600 text-sm">No assets found</div>
            </div>
        </ng-template>
      </div>
    </div>
  `
})
export class PortfolioSummaryComponent implements OnInit, OnDestroy {
  wallet: any;
  assets: any[] = [];
  prices: any = {};
  totalValue: number = 0;
  totalValueBtc: number = 0;

  private subscription!: Subscription;

  constructor(
    private walletService: WalletService,
    private marketService: MarketService,
    private router: Router
  ) { }

  ngOnInit() {
    this.subscription = this.marketService.prices$.subscribe(prices => {
      this.prices = prices;
      this.calculateTotalValue();
    });

    this.walletService.getWallet().subscribe(wallet => {
      this.wallet = wallet;
      // Show all assets with qty > 0
      this.assets = wallet.assets.filter((a: any) => a.quantity > 0);
      this.calculateTotalValue();
    });
  }

  refreshWallet() {
    // Compatibility method for legacy components.
    // The component now auto-updates via subscription.
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  calculateTotalValue() {
    if (!this.wallet || !this.wallet.assets) return;

    let usd = 0;
    this.wallet.assets.forEach((a: any) => {
      if (a.symbol === 'USD') {
        usd += a.quantity;
      } else {
        const price = this.prices[a.symbol.toLowerCase()] || 0;
        usd += a.quantity * price;
      }
    });
    this.totalValue = usd;

    const btcPrice = this.prices['bitcoin'] || 1;
    this.totalValueBtc = usd / btcPrice;
  }

  getAssetValue(asset: any): number {
    if (asset.symbol === 'USD') return asset.quantity;
    const price = this.prices[asset.symbol.toLowerCase()] || 0;
    return asset.quantity * price;
  }

  navigateToTrade(symbol: string) {
    this.router.navigate(['/dashboard/trade', symbol.toLowerCase()]);
  }
}
