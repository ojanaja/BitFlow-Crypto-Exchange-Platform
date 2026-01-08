import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { PortfolioSummaryComponent } from '../../components/portfolio-summary/portfolio-summary.component';
import { MatIconModule } from '@angular/material/icon';
import { MarketListComponent } from '../../components/market-list/market-list.component';
import { WalletService } from '../../../../core/services/wallet.service';
import { MarketService } from '../../../../core/services/market.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepositDialogComponent } from '../../components/deposit-dialog/deposit-dialog.component';
import { WithdrawDialogComponent } from '../../components/withdraw-dialog/withdraw-dialog.component';

@Component({
   selector: 'app-overview-page',
   template: `
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Profile & Privacy Section -->
      <div class="flex items-center justify-between">
         <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">U</div>
            <div>
               <h1 class="text-2xl font-bold text-white">Welcome back, User</h1>
               <div class="flex items-center gap-2 text-slate-400 text-sm">
                  <span>UID: 727805862</span>
                  <span class="px-1.5 py-0.5 bg-slate-800 rounded text-xs text-indigo-400 border border-slate-700">Regular User</span>
               </div>
            </div>
         </div>
      </div>

      <!-- Estimated Balance Card (Binance Style) -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div class="relative z-10">
             <div class="flex items-center justify-between mb-4">
                <span class="text-slate-400 font-medium">Estimated Balance</span>
                <div class="flex gap-2">
                   <button (click)="openDepositDialog()" class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors border border-slate-700 hover:border-slate-600">Deposit</button>
                   <button (click)="openWithdrawDialog()" class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors border border-slate-700 hover:border-slate-600">Withdraw</button>
                </div>
             </div>

             <div class="flex items-baseline gap-2 mb-1">
                 <h2 class="text-4xl lg:text-5xl font-bold text-white tracking-tight">{{ totalBalanceBtc | number:'1.2-8' }} <span class="text-xl lg:text-2xl text-slate-400 font-normal">BTC</span></h2>
             </div>
             <p class="text-slate-400 text-sm">≈ {{ totalBalanceUsd | currency:'USD' }}</p>
             
             <div class="mt-4 flex items-center gap-2 text-sm">
                <span class="text-slate-400">Total Portfolio Value</span>
             </div>
          </div>
      </div>

      <!-- Quick Market / My Assets -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <!-- My Assets Summary -->
         <div class="lg:col-span-2">
            <h3 class="text-lg font-semibold text-white mb-4">My Assets</h3>
            <app-portfolio-summary></app-portfolio-summary>
         </div>

         <!-- Quick Discovery / Gainers -->
         <div>
            <h3 class="text-lg font-semibold text-white mb-4">Market Trends</h3>
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
               
               <div *ngFor="let market of topMarkets" class="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded transition-colors cursor-default">
                  <div class="flex items-center gap-3">
                     <div class="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-700">
                        {{ market.symbol[0] | uppercase }}
                     </div>
                     <div>
                        <p class="font-bold text-white uppercase">{{ market.symbol }}</p>
                        <p class="text-xs text-slate-500">Crypto</p>
                     </div>
                  </div>
                  <div class="text-right">
                     <p class="text-white font-medium">{{ market.price | currency:'USD':'symbol':'1.2-2' }}</p>
                     <p class="text-xs" [ngClass]="market.change >= 0 ? 'text-emerald-400' : 'text-red-400'">
                        {{ market.change >= 0 ? '+' : '' }}{{ market.change }}%
                     </p>
                  </div>
               </div>

            </div>
         </div>
      </div>
    </div>
  `
})
export class OverviewPageComponent implements OnInit {
   totalBalanceUsd = 0;
   totalBalanceBtc = 0;
   topMarkets: any[] = [];

   private prices: any = {};

   constructor(
      private walletService: WalletService,
      private marketService: MarketService,
      private dialog: MatDialog,
      private snackBar: MatSnackBar
   ) { }

   ngOnInit() {
      // Subscribe to prices to keep local cache
      this.marketService.prices$.subscribe(prices => {
         this.prices = prices;
         this.updateBalance();
         this.updateTopMarkets();
      });

      this.walletService.getWallet().subscribe(wallet => {
         if (wallet && wallet.assets) {
            this.updateBalance();
         }
      });
   }

   updateBalance() {
      this.walletService.getWallet().subscribe(wallet => {
         if (!wallet || !wallet.assets) return;

         let usd = 0;
         wallet.assets.forEach((a: any) => {
            if (a.symbol === 'USD') {
               usd += a.quantity;
            } else {
               const price = this.prices[a.symbol.toLowerCase()] || 0;
               usd += a.quantity * price;
            }
         });

         const btcPrice = this.prices['bitcoin'] || 1;
         this.totalBalanceUsd = usd;
         this.totalBalanceBtc = usd / btcPrice;
      });
   }

   updateTopMarkets() {
      // Mocking some "change" percentage since we only have raw prices
      // In a real app, API would provide 24h change.
      const symbols = ['bitcoin', 'ethereum', 'solana', 'cardano'];
      this.topMarkets = symbols.map(sym => ({
         symbol: sym,
         price: this.prices[sym] || 0,
         change: (Math.random() * 10 - 5).toFixed(2) // Fake change for demo visual
      })).filter(m => m.price > 0);
   }

   openDepositDialog() {
      const dialogRef = this.dialog.open(DepositDialogComponent, {
         width: '400px',
         panelClass: 'custom-dialog-container'
      });

      dialogRef.afterClosed().subscribe(result => {
         if (result) {
            this.updateBalance(); // Refresh balance
         }
      });
   }

   openWithdrawDialog() {
      const dialogRef = this.dialog.open(WithdrawDialogComponent, {
         width: '400px',
         panelClass: 'custom-dialog-container'
      });

      dialogRef.afterClosed().subscribe(result => {
         if (result) {
            this.updateBalance(); // Refresh balance
         }
      });
   }
}
