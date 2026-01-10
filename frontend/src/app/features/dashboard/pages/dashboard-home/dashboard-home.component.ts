import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MarketService } from '../../../../core/services/market.service';
import { SolanaService } from '../../../../core/services/solana.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PortfolioSummaryComponent } from '../../components/portfolio-summary/portfolio-summary.component';
import { DepositDialogComponent } from '../../components/deposit-dialog/deposit-dialog.component';

@Component({
  selector: 'app-dashboard-home',
  template: `
    <div class="container mx-auto p-4 lg:p-6 max-w-7xl">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
            <h1 class="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Trading Dashboard
            </h1>
            <p class="text-slate-400 text-xs lg:text-sm mt-1">Real-time market insights and portfolio management</p>
            <div *ngIf="walletAddress" class="mt-2 flex items-center gap-2 text-sm">
                <span class="text-slate-400">Wallet:</span>
                <span class="text-slate-200 font-mono bg-slate-800 px-2 py-0.5 rounded">{{ shortenAddress(walletAddress) }}</span>
                <span *ngIf="balance !== null" class="text-green-400 ml-2 font-medium">{{ balance | number:'1.2-4' }} SOL</span>
            </div>
        </div>
        
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
             <!-- Tabs -->
             <div class="bg-slate-900 p-1 rounded-lg border border-slate-800 flex flex-nowrap shrink-0">
                <button (click)="activeTab = 'trading'" 
                    [class]="activeTab === 'trading' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
                    class="px-3 lg:px-4 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all whitespace-nowrap">
                    Trading
                </button>
                <button (click)="activeTab = 'analytics'" 
                    [class]="activeTab === 'analytics' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
                    class="px-3 lg:px-4 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all whitespace-nowrap">
                    Analytics
                </button>
                <button (click)="activeTab = 'alerts'" 
                    [class]="activeTab === 'alerts' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
                    class="px-3 lg:px-4 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all whitespace-nowrap">
                    Alerts
                </button>
             </div>

             <div class="hidden sm:block h-6 w-px bg-slate-800 mx-2"></div>

             <div class="flex gap-2 w-full sm:w-auto">
                 <button mat-flat-button color="primary" class="!bg-violet-600 !text-white !rounded-lg flex-1 sm:flex-none" (click)="openDepositDialog()">
                    <span class="font-medium">Deposit</span>
                 </button>
                 <button mat-stroked-button class="!border-red-900/30 !text-red-400 !bg-red-900/10 !rounded-lg flex-1 sm:flex-none hover:!bg-red-900/20" (click)="logout()">
                    <span class="font-medium">Disconnect</span>
                 </button>
             </div>
        </div>
      </div>

      <!-- Trading View -->
      <div *ngIf="activeTab === 'trading'" class="grid grid-cols-12 gap-4 lg:gap-6">
        <!-- Portfolio (Left - 4 cols / Full on Mobile) -->
        <div class="col-span-12 lg:col-span-4 space-y-4 lg:space-y-6">
          <app-portfolio-summary #portfolio></app-portfolio-summary>
          <app-trade-form (orderPlaced)="refreshWallet()"></app-trade-form>
          
          <!-- Order Book (Hide on very small screens? No, maybe just shorter) -->
          <div class="h-[400px] lg:h-[600px]">
            <app-order-book></app-order-book>
          </div>
        </div>
        
        <!-- Main Content (Right - 8 cols / Full on Mobile) -->
        <div class="col-span-12 lg:col-span-8 flex flex-col gap-4 lg:gap-6">
          <!-- Charts Area -->
          <div class="h-[300px] lg:h-[500px] relative">
             <!-- Toggle -->
             <div class="absolute top-4 right-16 z-20 flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                <button (click)="chartMode = 'PRICE'" 
                    [class]="chartMode === 'PRICE' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-300'"
                    class="px-3 py-1 text-xs font-bold rounded-md transition-all">
                    Price
                </button>
                <button (click)="chartMode = 'DEPTH'" 
                    [class]="chartMode === 'DEPTH' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-300'"
                    class="px-3 py-1 text-xs font-bold rounded-md transition-all">
                    Depth
                </button>
             </div>

             <app-price-chart *ngIf="chartMode === 'PRICE'"></app-price-chart>
             <app-depth-chart *ngIf="chartMode === 'DEPTH'"></app-depth-chart>
          </div>
          
          <!-- Market Prices -->
          <app-market-list></app-market-list>
          
          <!-- Order History -->
          <app-order-history></app-order-history>
        </div>
      </div>

      <!-- Analytics and Alerts View adjustments for padding -->
      <div *ngIf="activeTab === 'analytics'" class="h-[calc(100vh-200px)] min-h-[500px]">
        <app-analytics></app-analytics>
      </div>

      <div *ngIf="activeTab === 'alerts'" class="h-[calc(100vh-200px)] min-h-[500px]">
        <app-alerts></app-alerts>
      </div>

    </div>
  `
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  @ViewChild('portfolio') portfolioSummary!: PortfolioSummaryComponent;
  activeTab: 'trading' | 'analytics' | 'alerts' = 'trading';
  chartMode: 'PRICE' | 'DEPTH' = 'PRICE';

  walletAddress: string | null = null;
  balance: number | null = null;

  constructor(
    private marketService: MarketService,
    private solanaService: SolanaService,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.marketService.connect();

    this.solanaService.walletAddress$.subscribe(address => {
      this.walletAddress = address;
      if (address) {
        this.fetchBalance(address);
      }
    });

    if (!this.walletAddress) {
      const stored = localStorage.getItem('walletAddress');
      if (stored) {
        this.walletAddress = stored;
        this.fetchBalance(stored);
      }
    }
  }

  async fetchBalance(address: string) {
    this.balance = await this.solanaService.getBalance(address);
  }

  shortenAddress(address: string): string {
    if (!address) return '';
    return address.slice(0, 4) + '...' + address.slice(-4);
  }

  logout() {
    this.solanaService.disconnect();
    this.authService.logout();
  }

  ngOnDestroy() {
    this.marketService.disconnect();
  }

  refreshWallet() {
    if (this.portfolioSummary) {
      this.portfolioSummary.refreshWallet();
    }
    if (this.walletAddress) {
      this.fetchBalance(this.walletAddress);
    }
  }

  openDepositDialog() {
    const dialogRef = this.dialog.open(DepositDialogComponent, {
      width: '400px',
      panelClass: 'bg-transparent'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshWallet();
      }
    });
  }
}
