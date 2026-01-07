import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../../../core/services/wallet.service';

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
            {{ getUsdBalance() | number:'1.2-2' }}
        </div>
        <div class="text-sm text-emerald-500/80 mt-2 font-medium flex items-center gap-1">
            <span>+2.4%</span>
            <span class="text-slate-500 font-normal">vs last month</span>
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
                        <div class="text-xs text-slate-500">Crypto Asset</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-mono font-bold text-slate-200">{{ asset.quantity | number:'1.2-6' }}</div>
                    <div class="text-xs text-slate-500">~ $0.00</div>
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
export class PortfolioSummaryComponent implements OnInit {
  wallet: any;
  assets: any[] = [];

  constructor(private walletService: WalletService) { }

  ngOnInit() {
    this.refreshWallet();
  }

  refreshWallet() {
    this.walletService.getWallet().subscribe(wallet => {
      this.wallet = wallet;
      this.assets = wallet.assets.filter((a: any) => a.symbol !== 'USD' && a.quantity > 0);
    });
  }

  getUsdBalance(): number {
    return this.wallet?.assets.find((a: any) => a.symbol === 'USD')?.quantity || 0;
  }
}
