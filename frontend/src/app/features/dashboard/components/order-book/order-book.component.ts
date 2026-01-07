import { Component, OnInit } from '@angular/core';
import { MarketService } from '../../../../core/services/market.service';

@Component({
    selector: 'app-order-book',
    template: `
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
      <div class="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex justify-between items-center">
        <h3 class="font-bold text-white text-md">Order Book</h3>
        <span class="text-[10px] text-slate-500 font-mono uppercase tracking-widest">BTC/USD</span>
      </div>
      
      <div class="flex-1 overflow-hidden flex flex-col pt-2">
        <!-- Asks (Sells) -->
        <div class="flex-1 flex flex-col-reverse overflow-hidden">
            <div *ngFor="let ask of orderBook?.asks; let i = index" class="relative group cursor-pointer">
                <div class="absolute inset-y-0 right-0 bg-rose-500/10 transition-all duration-300" 
                     [style.width.%]="(ask.quantity / maxQty) * 100"></div>
                <div class="relative flex justify-between px-4 py-1 text-[11px] font-mono hover:bg-slate-800/50">
                    <span class="text-rose-400 font-bold w-1/3">{{ ask.price | number:'1.2-2' }}</span>
                    <span class="text-slate-300 text-right w-1/3">{{ ask.quantity | number:'1.4-4' }}</span>
                    <span class="text-slate-500 text-right w-1/3">{{ ask.total | number:'1.2-2' }}</span>
                </div>
            </div>
        </div>

        <!-- Spread -->
        <div class="bg-slate-950 py-2 border-y border-slate-800 flex justify-center items-center gap-3">
            <span class="text-xs font-bold" [class]="priceColorClass">
                {{ currentPrice | number:'1.2-2' }}
            </span>
            <span class="text-[10px] text-slate-600 font-mono uppercase">Spread: {{ spread | number:'1.2-2' }}</span>
        </div>

        <!-- Bids (Buys) -->
        <div class="flex-1 overflow-hidden pt-1">
            <div *ngFor="let bid of orderBook?.bids" class="relative group cursor-pointer">
                <div class="absolute inset-y-0 right-0 bg-emerald-500/10 transition-all duration-300" 
                     [style.width.%]="(bid.quantity / maxQty) * 100"></div>
                <div class="relative flex justify-between px-4 py-1 text-[11px] font-mono hover:bg-slate-800/50">
                    <span class="text-emerald-400 font-bold w-1/3">{{ bid.price | number:'1.2-2' }}</span>
                    <span class="text-slate-300 text-right w-1/3">{{ bid.quantity | number:'1.4-4' }}</span>
                    <span class="text-slate-500 text-right w-1/3">{{ bid.total | number:'1.2-2' }}</span>
                </div>
            </div>
        </div>
      </div>
      
      <!-- Footer Metadata -->
      <div class="px-4 py-2 border-t border-slate-800 bg-slate-950/50 flex justify-between text-[10px] text-slate-600 uppercase font-mono">
        <span>Level</span>
        <span>Amount (BTC)</span>
        <span>Total (BTC)</span>
      </div>
    </div>
  `
})
export class OrderBookComponent implements OnInit {
    orderBook: any = null;
    maxQty: number = 1;
    spread: number = 0;
    currentPrice: number = 0;
    priceColorClass: string = 'text-white';

    constructor(private marketService: MarketService) { }

    ngOnInit() {
        this.marketService.orderBook$.subscribe(data => {
            if (data) {
                this.orderBook = data;
                this.calculateMetrics();
            }
        });

        this.marketService.prices$.subscribe(prices => {
            const newPrice = prices['bitcoin'];
            if (newPrice) {
                this.priceColorClass = newPrice >= this.currentPrice ? 'text-emerald-400' : 'text-rose-400';
                this.currentPrice = newPrice;
            }
        });
    }

    private calculateMetrics() {
        if (!this.orderBook) return;

        const allEntries = [...this.orderBook.bids, ...this.orderBook.asks];
        this.maxQty = Math.max(...allEntries.map(e => e.quantity)) || 1;

        if (this.orderBook.asks.length > 0 && this.orderBook.bids.length > 0) {
            this.spread = this.orderBook.asks[0].price - this.orderBook.bids[0].price;
        }
    }
}
