import { Component } from '@angular/core';

@Component({
    selector: 'app-orders-page',
    template: `
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold text-white mb-6">Order History</h1>
      <app-order-history></app-order-history>
    </div>
  `
})
export class OrdersPageComponent { }
