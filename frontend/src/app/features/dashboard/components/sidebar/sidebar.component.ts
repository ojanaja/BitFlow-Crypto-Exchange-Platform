import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  template: `
    <div
      class="h-screen w-16 lg:w-64 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 items-center lg:items-stretch"
    >
      <!-- Logo -->
      <div
        class="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-200"
      >
        <img src="/assets/images/logo.png" class="h-8 w-10" />
        <span class="ml-2 font-bold text-xl text-slate-900 hidden lg:block"
          >Bit<span class="text-emerald-600">Flow</span></span
        >
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-6 space-y-2 px-2 lg:px-4">
        <a
          routerLink="/dashboard/overview"
          routerLinkActive="bg-emerald-100 text-emerald-600"
          class="flex items-center p-3 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-colors group relative"
        >
          <mat-icon class="material-icons-outlined">dashboard</mat-icon>
          <span class="ml-3 font-medium hidden lg:block">Dashboard</span>
          <span
            class="lg:hidden absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap"
            >Dashboard</span
          >
        </a>

        <a
          routerLink="/dashboard/markets"
          routerLinkActive="bg-emerald-100 text-emerald-600"
          class="flex items-center p-3 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-colors group relative"
        >
          <mat-icon class="material-icons-outlined">bar_chart</mat-icon>
          <span class="ml-3 font-medium hidden lg:block">Markets</span>
          <span
            class="lg:hidden absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap"
            >Markets</span
          >
        </a>

        <a
          routerLink="/dashboard/assets"
          routerLinkActive="bg-emerald-100 text-emerald-600"
          class="flex items-center p-3 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-colors group relative"
        >
          <mat-icon class="material-icons-outlined"
            >account_balance_wallet</mat-icon
          >
          <span class="ml-3 font-medium hidden lg:block">Assets</span>
          <span
            class="lg:hidden absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap"
            >Assets</span
          >
        </a>

        <a
          routerLink="/dashboard/orders"
          routerLinkActive="bg-emerald-100 text-emerald-600"
          class="flex items-center p-3 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-colors group relative"
        >
          <mat-icon class="material-icons-outlined">receipt_long</mat-icon>
          <span class="ml-3 font-medium hidden lg:block">Orders</span>
          <span
            class="lg:hidden absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap"
            >Orders</span
          >
        </a>

        <a
          routerLink="/dashboard/alerts"
          routerLinkActive="bg-emerald-100 text-emerald-600"
          class="flex items-center p-3 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-colors group relative"
        >
          <mat-icon class="material-icons-outlined">notifications</mat-icon>
          <span class="ml-3 font-medium hidden lg:block">Alerts</span>
          <span
            class="lg:hidden absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap"
            >Alerts</span
          >
        </a>
      </nav>

      <!-- User Profile (Condensed) -->
      <div class="border-t border-slate-200 p-4">
        <div class="flex items-center justify-center lg:justify-start">
          <div
            class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <mat-icon class="material-icons-outlined">person</mat-icon>
          </div>
          <div class="ml-3 hidden lg:block overflow-hidden">
            <p class="text-sm font-medium text-slate-900 truncate">User</p>
            <p class="text-xs text-slate-500 truncate">VIP 1</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        position: sticky;
        top: 0;
      }
    `,
  ],
})
export class SidebarComponent {}
