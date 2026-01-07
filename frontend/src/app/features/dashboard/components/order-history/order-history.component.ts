import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../../core/services/order.service';

@Component({
    selector: 'app-order-history',
    template: `
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div class="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <h3 class="font-bold text-white text-lg">Order History</h3>
      </div>
      
      <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-950">
                <tr class="text-slate-500 text-xs uppercase tracking-wider">
                <th class="py-3 px-4 font-semibold">Date</th>
                <th class="py-3 px-4 font-semibold">Side</th>
                <th class="py-3 px-4 font-semibold">Asset</th>
                <th class="py-3 px-4 text-right font-semibold">Qty</th>
                <th class="py-3 px-4 text-right font-semibold">Price</th>
                <th class="py-3 px-4 text-right font-semibold">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
                <tr *ngFor="let order of orders" class="hover:bg-slate-800/60 transition-colors">
                <td class="py-3 px-4 text-slate-400 font-mono text-xs">{{ order.timestamp | date:'MMM d, HH:mm' }}</td>
                <td class="py-3 px-4 font-bold text-xs" [ngClass]="{'text-emerald-400': order.type === 'BUY', 'text-rose-400': order.type === 'SELL'}">
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
                 <tr *ngIf="orders.length === 0">
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
export class OrderHistoryComponent implements OnInit {
    orders: any[] = [];

    constructor(private orderService: OrderService) { }

    ngOnInit() {
        this.refreshOrders();
    }

    refreshOrders() {
        this.orderService.getOrders().subscribe(orders => {
            this.orders = orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        });
    }
}
