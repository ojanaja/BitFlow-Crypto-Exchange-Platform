import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MarketService } from '../../../../core/services/market.service';
import { PortfolioSummaryComponent } from '../../components/portfolio-summary/portfolio-summary.component';

@Component({
  selector: 'app-dashboard-home',
  template: `
    <div class="container mx-auto p-6 max-w-7xl">
      <div class="flex items-center justify-between mb-8">
        <div>
            <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Trading Dashboard
            </h1>
            <p class="text-slate-400 text-sm mt-1">Real-time market insights and portfolio management</p>
        </div>
        <div class="flex gap-3">
             <button mat-flat-button color="primary" class="!bg-violet-600 !text-white !rounded-lg">
                <span class="font-medium">Deposit</span>
             </button>
             <button mat-stroked-button class="!border-slate-700 !text-slate-300 !rounded-lg">
                <span class="font-medium">Settings</span>
             </button>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-6">
        <!-- Portfolio (Left - 4 cols) -->
        <div class="col-span-12 lg:col-span-4 space-y-6">
          <app-portfolio-summary #portfolio></app-portfolio-summary>
          <app-trade-form (orderPlaced)="refreshWallet()"></app-trade-form>
          
          <!-- Order Book -->
          <div class="h-[600px]">
            <app-order-book></app-order-book>
          </div>
        </div>
        
        <!-- Main Content (Right - 8 cols) -->
        <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <!-- Price Chart -->
          <app-price-chart></app-price-chart>
          
          <!-- Market Prices -->
          <app-market-list></app-market-list>
          
          <!-- Order History -->
          <app-order-history></app-order-history>
        </div>
      </div>
    </div>
  `
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  @ViewChild('portfolio') portfolioSummary!: PortfolioSummaryComponent;

  constructor(private marketService: MarketService) { }

  ngOnInit() {
    this.marketService.connect();
  }

  ngOnDestroy() {
    this.marketService.disconnect();
  }

  refreshWallet() {
    if (this.portfolioSummary) {
      this.portfolioSummary.refreshWallet();
    }
  }
}
