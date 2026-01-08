import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PriceChartComponent } from '../../components/price-chart/price-chart.component';
import { DepthChartComponent } from '../../components/depth-chart/depth-chart.component';
import { OrderBookComponent } from '../../components/order-book/order-book.component';
import { TradeFormComponent } from '../../components/trade-form/trade-form.component';
import { OrderHistoryComponent } from '../../components/order-history/order-history.component';
import { PortfolioSummaryComponent } from '../../components/portfolio-summary/portfolio-summary.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarketService } from '../../../../core/services/market.service';

@Component({
   selector: 'app-trade-page',
   template: `
    <div class="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-100px)] gap-4 p-2">
       
       <!-- Top Bar: Coin Info (mocked for now, implies connection to route param) -->
       <div class="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
             <div class="text-xl font-bold text-white flex items-center gap-1">
                {{ symbol }} <span class="text-slate-500 text-sm font-normal">/ USD</span>
             </div>
             <div class="text-emerald-400 font-medium">$45,230.50</div>
          </div>
          <div class="flex gap-2">
             <button class="text-slate-400 hover:text-white"><mat-icon>star_border</mat-icon></button>
          </div>
       </div>

       <!-- Main Grid -->
       <div class="flex-1 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
          
          <!-- Middle: Chart (Flexible width) -->
          <div class="col-span-12 lg:col-span-6 xl:col-span-7 flex flex-col gap-4 overflow-hidden">
             <!-- Chart Container -->
             <div class="flex-1 bg-slate-900 border border-slate-800 rounded-lg flex flex-col min-h-[300px]">
                 <!-- Chart Toolbar -->
                 <div class="flex items-center justify-between p-2 border-b border-slate-800">
                    <div class="flex bg-slate-800 rounded p-0.5">
                       <button (click)="chartMode = 'PRICE'" [class.bg-slate-700]="chartMode === 'PRICE'" class="px-3 py-1 text-xs text-white rounded transition-colors">Price</button>
                       <button (click)="chartMode = 'DEPTH'" [class.bg-slate-700]="chartMode === 'DEPTH'" class="px-3 py-1 text-xs text-white rounded transition-colors">Depth</button>
                    </div>
                 </div>
                 
                 <!-- Chart Component -->
                 <div class="flex-1 relative">
                    <app-price-chart *ngIf="chartMode === 'PRICE'" [symbol]="symbol" class="absolute inset-0"></app-price-chart>
                    <app-depth-chart *ngIf="chartMode === 'DEPTH'" [symbol]="symbol" class="absolute inset-0"></app-depth-chart>
                 </div>
             </div>

             <!-- Bottom: Order History -->
             <div class="h-1/3 min-h-[200px] bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                 <div class="p-3 border-b border-slate-800 font-semibold text-slate-300 text-sm">Open Orders</div>
                 <div class="flex-1 overflow-y-auto">
                    <app-order-history [symbol]="symbol"></app-order-history>
                 </div>
             </div>
          </div>

          <!-- Left: Order Book (Hidden on small mobile? or stacked) -->
          <div class="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-2 flex flex-col gap-4 min-h-0">
              <div class="flex-1 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                 <div class="p-2 border-b border-slate-800 font-semibold text-slate-300 text-sm">Order Book</div>
                 <div class="flex-1 overflow-y-auto">
                     <app-order-book [symbol]="symbol"></app-order-book>
                 </div>
              </div>
          </div>

          <!-- Right: Trade Form -->
          <div class="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3 flex flex-col gap-4 min-h-0">
              <div class="bg-slate-900 border border-slate-800 rounded-lg p-4">
                 <app-trade-form [symbol]="symbol" (orderPlaced)="refreshWallet()"></app-trade-form>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-lg p-4 flex-1">
                 <h3 class="text-sm font-semibold text-slate-300 mb-3">Assets</h3>
                 <app-portfolio-summary #portfolio></app-portfolio-summary>
              </div>
          </div>

       </div>
    </div>
  `,
   styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class TradePageComponent implements OnInit {
   symbol: string = 'BTC';
   chartMode: 'PRICE' | 'DEPTH' = 'PRICE';

   constructor(private route: ActivatedRoute) { }

   ngOnInit() {
      this.route.paramMap.subscribe(params => {
         this.symbol = params.get('symbol') || 'BTC';
         // Here we would trigger MarketService to subscribe to this specific channel
      });
   }

   refreshWallet() {
      // connect to portfolio refresh
   }
}
