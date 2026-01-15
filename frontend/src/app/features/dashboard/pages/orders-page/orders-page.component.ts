import { Component } from '@angular/core';

@Component({
  selector: 'app-orders-page',
  template: `
    <div class="w-full mx-auto">
      <h1 class="text-2xl font-bold text-slate-900 mb-6">Order History</h1>
      <app-order-history></app-order-history>
    </div>
  `,
})
export class OrdersPageComponent {}
