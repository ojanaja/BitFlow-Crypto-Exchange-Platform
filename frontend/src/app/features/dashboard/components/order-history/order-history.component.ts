import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { OrderService } from '../../../../core/services/order.service';

@Component({
    selector: 'app-order-history',
    template: `
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
      <div class="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur shrink-0">
        <h3 class="font-bold text-white text-lg">Order History {{ symbol ? '(' + symbol + ')' : '' }}</h3>
      </div>
      
      <div class="overflow-x-auto flex-1">
            <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-950 sticky top-0 z-10">
                <tr class="text-slate-500 text-xs uppercase tracking-wider">
                <th class="py-3 px-4 font-semibold hidden sm:table-cell">Date</th>
                <th class="py-3 px-4 font-semibold">Side</th>
                <th class="py-3 px-4 font-semibold">Asset</th>
                <th class="py-3 px-4 text-right font-semibold">Qty</th>
                <th class="py-3 px-4 text-right font-semibold">Price</th>
                <th class="py-3 px-4 text-right font-semibold">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 overflow-y-auto">
                <tr *ngFor="let order of displayedOrders" class="hover:bg-slate-800/60 transition-colors">
                <td class="py-3 px-4 text-slate-400 font-mono text-xs hidden sm:table-cell">{{ order.timestamp | date:'MMM d, HH:mm' }}</td>
                <td class="py-3 px-4 font-bold text-xs" [ngClass]="{'text-emerald-400': order.type === 'BUY', 'text-rose-400': order.type === 'SELL'}">
                    <span *ngIf="order.category === 'LIMIT'" class="text-[10px] bg-slate-800 px-1 rounded mr-1 text-slate-400">LIMIT</span>
                    {{ order.type }}
                </td>
                <td class="py-3 px-4 font-bold text-slate-200">{{ order.symbol | uppercase }}</td>
                <td class="py-3 px-4 text-right text-slate-300 font-mono">{{ order.quantity }}</td>
                <td class="py-3 px-4 text-right text-slate-300 font-mono">{{ order.price | currency }}</td>
                <td class="py-3 px-4 text-right">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                        [ngClass]="{
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': order.status === 'FILLED',
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20': order.status === 'PENDING'
                        }">
                        {{ order.status }}
                    </span>
                </td>
                </tr>
                 <tr *ngIf="displayedOrders.length === 0">
                    <td colspan="6" class="text-center py-8">
                        <div class="flex flex-col items-center">
                            <div class="text-slate-600 font-medium">No order history found</div>
                            <div class="text-slate-700 text-xs mt-1">Place a trade to see it here</div>
                        </div>
                    </td>
                </tr>
            </tbody>
            </table>
        </div>
    </div>
  `
})
export class OrderHistoryComponent implements OnInit, OnChanges {
    @Input() symbol?: string;

    allOrders: any[] = [];
    displayedOrders: any[] = [];

    constructor(private orderService: OrderService) { }

    ngOnInit() {
        this.refreshOrders();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['symbol']) {
            this.filterOrders();
        }
    }

    refreshOrders() {
        this.orderService.getOrders().subscribe(orders => {
            this.allOrders = orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            this.filterOrders();
        });
    }

    filterOrders() {
        if (this.symbol) {
            this.displayedOrders = this.allOrders.filter(o => o.symbol.toUpperCase() === this.symbol?.toUpperCase());
        } else {
            this.displayedOrders = [...this.allOrders];
        }
    }
}
