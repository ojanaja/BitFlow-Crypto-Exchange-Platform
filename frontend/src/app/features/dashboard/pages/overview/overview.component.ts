import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../../../core/services/wallet.service';
import { MarketService } from '../../../../core/services/market.service';
import { SolanaService } from '../../../../core/services/solana.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepositDialogComponent } from '../../components/deposit-dialog/deposit-dialog.component';
import { WithdrawDialogComponent } from '../../components/withdraw-dialog/withdraw-dialog.component';

@Component({
  selector: 'app-overview-page',
  template: `
    <div class="w-full mx-auto space-y-6">
      <!-- Profile & Privacy Section -->
      <!-- <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xl"
          >
            U
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900">
              Welcome back, User
            </h1>
            <div class="flex items-center gap-2 text-slate-500 text-sm">
              <span>UID: 727805862</span>
              <span
                class="px-1.5 py-0.5 bg-slate-100 rounded text-xs text-emerald-600 border border-slate-200"
                >Regular User</span
              >
            </div>
          </div>
        </div>
      </div> -->

      <!-- Estimated Balance Card -->
      <div
        class="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm"
      >
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"
        ></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-500 font-medium">Estimated Balance</span>
            <div class="flex gap-2">
              <button
                (click)="openDepositDialog()"
                class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-sm transition-colors border border-slate-200 hover:border-slate-300"
              >
                Deposit
              </button>
              <button
                (click)="openWithdrawDialog()"
                class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-sm transition-colors border border-slate-200 hover:border-slate-300"
              >
                Withdraw
              </button>
            </div>
          </div>

          <div class="flex items-baseline gap-2 mb-1">
            <h2
              class="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight"
            >
              {{ totalBalanceSol | number : '1.2-4' }}
              <span class="text-xl lg:text-2xl text-slate-400 font-normal"
                >SOL</span
              >
            </h2>
          </div>
          <p class="text-slate-500 text-sm">
            ≈ {{ totalBalanceUsd | currency : 'USD' }}
          </p>

          <div class="mt-4 flex items-center gap-2 text-sm">
            <span class="text-slate-500">Total Portfolio Value</span>
          </div>
        </div>
      </div>

      <!-- Quick Market / My Assets -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- My Assets Summary -->
        <div class="lg:col-span-2">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">My Assets</h3>
          <app-portfolio-summary></app-portfolio-summary>
        </div>

        <!-- Quick Discovery / Gainers -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-900">Market Trends</h3>
            <div
              class="flex bg-slate-100 rounded-lg p-1 border border-slate-200"
            >
              <button
                (click)="setActiveTab('watchlist')"
                [class.bg-white]="activeTab === 'watchlist'"
                [class.text-emerald-700]="activeTab === 'watchlist'"
                [class.shadow-sm]="activeTab === 'watchlist'"
                [class.text-slate-500]="activeTab !== 'watchlist'"
                class="px-3 py-1 rounded text-xs font-medium transition-all"
              >
                Watchlist
              </button>
              <button
                (click)="setActiveTab('gainers')"
                [class.bg-white]="activeTab === 'gainers'"
                [class.text-emerald-700]="activeTab === 'gainers'"
                [class.shadow-sm]="activeTab === 'gainers'"
                [class.text-slate-500]="activeTab !== 'gainers'"
                class="px-3 py-1 rounded text-xs font-medium transition-all"
              >
                Gainers
              </button>
              <button
                (click)="setActiveTab('losers')"
                [class.bg-white]="activeTab === 'losers'"
                [class.text-emerald-700]="activeTab === 'losers'"
                [class.shadow-sm]="activeTab === 'losers'"
                [class.text-slate-500]="activeTab !== 'losers'"
                class="px-3 py-1 rounded text-xs font-medium transition-all"
              >
                Losers
              </button>
              <button
                (click)="setActiveTab('volume')"
                [class.bg-white]="activeTab === 'volume'"
                [class.text-emerald-700]="activeTab === 'volume'"
                [class.shadow-sm]="activeTab === 'volume'"
                [class.text-slate-500]="activeTab !== 'volume'"
                class="px-3 py-1 rounded text-xs font-medium transition-all"
              >
                Volume
              </button>
            </div>
          </div>

          <div
            class="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm"
          >
            <div
              *ngFor="let market of topMarkets"
              class="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors cursor-default"
            >
              <div class="flex items-center gap-3">
                <!-- Icon Container -->
                <div class="relative w-8 h-8 flex-shrink-0">
                  <img
                    [src]="
                      'https://assets.coincap.io/assets/icons/' +
                      market.symbol.toLowerCase() +
                      '@2x.png'
                    "
                    (error)="market.imageError = true"
                    [class.hidden]="market.imageError"
                    class="w-8 h-8 rounded-full"
                    alt="{{ market.symbol }}"
                  />

                  <!-- Fallback (shown if image error) -->
                  <div
                    *ngIf="market.imageError"
                    class="absolute inset-0 w-full h-full rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200"
                  >
                    {{ market.symbol[0] | uppercase }}
                  </div>
                </div>

                <div>
                  <p class="font-bold text-slate-900 uppercase">
                    {{ market.symbol }}
                  </p>
                  <p class="text-xs text-slate-500">
                    {{ market.name | titlecase }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-slate-900 font-medium">
                  {{
                    market.price
                      | currency
                        : 'USD'
                        : 'symbol'
                        : (market.price < 1 ? '1.4-6' : '1.2-2')
                  }}
                </p>
                <p
                  *ngIf="activeTab !== 'volume'"
                  class="text-xs"
                  [ngClass]="
                    market.change >= 0 ? 'text-emerald-600' : 'text-rose-500'
                  "
                >
                  {{ market.change >= 0 ? '+' : ''
                  }}{{ market.change | number : '1.2-2' }}%
                </p>
                <p
                  *ngIf="activeTab === 'volume'"
                  class="text-xs text-slate-400"
                >
                  Vol:
                  {{ market.volume | currency : 'USD' : 'symbol' : '1.0-0' }}
                </p>
              </div>
            </div>

            <div
              *ngIf="topMarkets.length === 0"
              class="text-center py-4 text-slate-500 text-sm"
            >
              Loading trends...
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OverviewPageComponent implements OnInit {
  totalBalanceUsd = 0;
  totalBalanceSol = 0;
  topMarkets: any[] = [];
  walletAddress: string | null = null;

  private prices: any = {};

  constructor(
    private walletService: WalletService,
    private marketService: MarketService,
    private solanaService: SolanaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  activeTab: 'watchlist' | 'gainers' | 'losers' | 'volume' = 'watchlist';
  marketTrends: any = { gainers: [], losers: [], volume: [] };
  allMarkets: any[] = [];
  watchlist: string[] = [];

  ngOnInit() {
    this.marketService.prices$.subscribe((prices) => {
      this.prices = prices;
      this.updateBalance();

      if (this.activeTab === 'watchlist') {
        this.updateTopMarkets();
      }
    });

    this.marketService.marketTrends$.subscribe((trends) => {
      this.marketTrends = trends;
      if (this.activeTab !== 'watchlist') {
        this.updateTopMarkets();
      }
    });

    this.marketService.allMarkets$.subscribe((markets) => {
      this.allMarkets = markets;
      if (this.activeTab === 'watchlist') {
        this.updateTopMarkets();
      }
    });

    this.marketService.watchlist$.subscribe((list) => {
      this.watchlist = list;
      if (this.activeTab === 'watchlist') {
        this.updateTopMarkets();
      }
    });

    this.solanaService.walletAddress$.subscribe((address) => {
      this.walletAddress = address;
      this.updateBalance();
    });

    if (!this.walletAddress) {
      const stored = localStorage.getItem('walletAddress');
      if (stored) {
        this.walletAddress = stored;
        this.updateBalance();
      }
    }

    this.updateTopMarkets();
  }

  async updateBalance() {
    if (!this.walletAddress) return;

    const solBalance = await this.solanaService.getBalance(this.walletAddress);
    this.totalBalanceSol = solBalance;

    const solPrice = this.prices['solana'] || 0;
    this.totalBalanceUsd = solBalance * solPrice;
  }

  private assetToSymbol: { [key: string]: string } = {
    bitcoin: 'btc',
    ethereum: 'eth',
    solana: 'sol',
    xrp: 'xrp',
    cardano: 'ada',
    dogecoin: 'doge',
    polkadot: 'dot',
    chainlink: 'link',
    litecoin: 'ltc',
  };

  setActiveTab(tab: 'watchlist' | 'gainers' | 'losers' | 'volume') {
    this.activeTab = tab;
    this.updateTopMarkets();
  }

  updateTopMarkets() {
    if (this.activeTab === 'watchlist') {
      const watchlistItems = this.allMarkets.filter((coin) =>
        this.watchlist.includes((coin.id || coin.name).toLowerCase())
      );

      this.topMarkets = watchlistItems.map((item) => {
        const realTimePrice =
          this.prices[item.name.toLowerCase()] ||
          this.prices[item.id?.toLowerCase()];

        return {
          name: item.name,
          symbol: item.symbol,
          price: realTimePrice || item.price,
          change: item.change,
          volume: item.volume,
          imageError: false,
          imageKey: item.imageKey,
        };
      });
    } else {
      const data = this.marketTrends[this.activeTab] || [];
      this.topMarkets = data.map((item: any) => ({
        name: item.name,
        symbol: item.symbol,
        price: item.price,
        change: item.change,
        volume: item.volume,
        imageError: false,
        imageKey: item.imageKey,
      }));
    }
  }

  openDepositDialog() {
    const dialogRef = this.dialog.open(DepositDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateBalance();
      }
    });
  }

  openWithdrawDialog() {
    const dialogRef = this.dialog.open(WithdrawDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateBalance();
      }
    });
  }
}
