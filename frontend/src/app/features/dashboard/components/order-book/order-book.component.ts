import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MarketService } from '../../../../core/services/market.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-order-book',
    template: `
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
        <!-- Header Tabs -->
        <div class="flex items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur shrink-0">
            <button class="flex-1 py-3 text-sm font-bold transition-colors border-b-2"
                [class.border-violet-500]="activeTab === 'BOOK'"
                [class.text-white]="activeTab === 'BOOK'"
                [class.border-transparent]="activeTab !== 'BOOK'"
                [class.text-slate-400]="activeTab !== 'BOOK'"
                (click)="activeTab = 'BOOK'">
                Order Book
            </button>
            <button class="flex-1 py-3 text-sm font-bold transition-colors border-b-2"
                [class.border-violet-500]="activeTab === 'TRADES'"
                [class.text-white]="activeTab === 'TRADES'"
                [class.border-transparent]="activeTab !== 'TRADES'"
                [class.text-slate-400]="activeTab !== 'TRADES'"
                (click)="activeTab = 'TRADES'">
                Recent Trades
            </button>
        </div>

        <!-- Order Book View -->
        <div *ngIf="activeTab === 'BOOK'" class="flex-1 overflow-hidden flex flex-col pt-2">
            <!-- Asks (Sells) -->
            <div class="flex-1 flex flex-col-reverse overflow-hidden">
                <div *ngFor="let ask of orderBook?.asks" class="relative group cursor-pointer">
                    <div class="absolute inset-y-0 right-0 bg-rose-500/10 transition-all duration-300"
                        [style.width.%]="(ask.quantity / maxQty) * 100"></div>
                    <div class="relative flex justify-between px-4 py-1 text-[11px] font-mono hover:bg-slate-800/50">
                        <span class="text-rose-400 font-bold w-1/3">{{ ask.price | number:'1.2-2' }}</span>
                        <span class="text-slate-300 text-right w-1/2 sm:w-1/3">{{ ask.quantity | number:'1.4-4' }}</span>
                        <span class="text-slate-500 text-right w-1/3 hidden sm:block">{{ ask.total | number:'1.2-2' }}</span>
                    </div>
                </div>
            </div>

            <!-- Spread -->
            <div class="bg-slate-950 py-2 border-y border-slate-800 flex justify-center items-center gap-3 shrink-0">
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
                        <span class="text-emerald-400 font-bold w-1/2 sm:w-1/3">{{ bid.price | number:'1.2-2' }}</span>
                        <span class="text-slate-300 text-right w-1/2 sm:w-1/3">{{ bid.quantity | number:'1.4-4' }}</span>
                        <span class="text-slate-500 text-right w-1/3 hidden sm:block">{{ bid.total | number:'1.2-2' }}</span>
                    </div>
                </div>
            </div>

            <!-- Footer Metadata -->
            <div class="px-4 py-2 border-t border-slate-800 bg-slate-950/50 flex justify-between text-[10px] text-slate-600 uppercase font-mono shrink-0">
                <span>Level</span>
                <span class="text-right w-1/2 sm:w-auto">Amount</span>
                <span class="hidden sm:block">Total (BTC)</span>
            </div>
        </div>

        <!-- Recent Trades View -->
        <div *ngIf="activeTab === 'TRADES'" class="flex-1 overflow-hidden flex flex-col">
            <div class="px-4 py-2 bg-slate-950/50 border-b border-slate-800 flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider shrink-0">
                <span class="w-1/3 text-left">Price (USD)</span>
                <span class="w-1/3 text-right">Amount (BTC)</span>
                <span class="w-1/3 text-right">Time</span>
            </div>

            <div class="flex-1 overflow-auto">
                <div *ngFor="let trade of recentTrades" class="flex justify-between px-4 py-1.5 text-[11px] font-mono hover:bg-slate-800/30 transition-colors animate-fade-in">
                    <span class="font-bold w-1/3 text-left" [class.text-emerald-400]="trade.side === 'BUY'" [class.text-rose-400]="trade.side === 'SELL'">
                        {{ trade.price | number:'1.2-2' }}
                    </span>
                    <span class="text-slate-300 w-1/3 text-right">{{ trade.size | number:'1.4-4' }}</span>
                    <span class="text-slate-500 w-1/3 text-right">{{ trade.time | date:'HH:mm:ss' }}</span>
                </div>
            </div>
        </div>
    </div>
    `
})
export class OrderBookComponent implements OnInit, OnDestroy {
    @Input() symbol: string = 'BTC';
    orderBook: any = null;
    recentTrades: any[] = [];
    maxQty: number = 1;
    spread: number = 0;
    currentPrice: number = 0;
    priceColorClass: string = 'text-white';

    activeTab: 'BOOK' | 'TRADES' = 'BOOK';
    private subscriptions: Subscription = new Subscription();

    constructor(private marketService: MarketService) { }

    ngOnInit() {
        this.subscriptions.add(
            this.marketService.orderBook$.subscribe(data => {
                if (data) {
                    this.orderBook = data;
                    this.calculateMetrics();
                }
            })
        );

        this.subscriptions.add(
            this.marketService.prices$.subscribe(prices => {
                const newPrice = prices['bitcoin']; // TODO: Use this.symbol to get dynamic price key
                if (newPrice) {
                    this.priceColorClass = newPrice >= this.currentPrice ? 'text-emerald-400' : 'text-rose-400';
                    this.currentPrice = newPrice;
                }
            })
        );

        this.subscriptions.add(
            this.marketService.recentTrades$.subscribe(trades => {
                this.recentTrades = trades;
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    private calculateMetrics() {
        if (!this.orderBook) return;

        const allEntries = [...(this.orderBook.bids || []), ...(this.orderBook.asks || [])];
        if (allEntries.length > 0) {
            this.maxQty = Math.max(...allEntries.map(e => e.quantity)) || 1;
        }

        if (this.orderBook.asks && this.orderBook.asks.length > 0 && this.orderBook.bids && this.orderBook.bids.length > 0) {
            this.spread = this.orderBook.asks[0].price - this.orderBook.bids[0].price;
        }
    }
}
