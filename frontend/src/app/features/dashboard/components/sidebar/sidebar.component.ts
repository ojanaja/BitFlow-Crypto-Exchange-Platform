import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-sidebar',
    template: `
    <div class="h-screen w-16 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 items-center lg:items-stretch">
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
        <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
          B
        </div>
        <span class="ml-3 font-bold text-xl text-white hidden lg:block">BitFlow</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-6 space-y-2 px-2 lg:px-4">
        
        <a routerLink="/dashboard/overview" routerLinkActive="bg-slate-800 text-indigo-400" 
           class="flex items-center p-3 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group relative">
           <mat-icon class="material-icons-outlined">dashboard</mat-icon>
           <span class="ml-3 font-medium hidden lg:block">Dashboard</span>
           <span class="lg:hidden absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">Dashboard</span>
        </a>

        <a routerLink="/dashboard/markets" routerLinkActive="bg-slate-800 text-indigo-400" 
           class="flex items-center p-3 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group relative">
           <mat-icon class="material-icons-outlined">bar_chart</mat-icon>
           <span class="ml-3 font-medium hidden lg:block">Markets</span>
           <span class="lg:hidden absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">Markets</span>
        </a>

        <a routerLink="/dashboard/assets" routerLinkActive="bg-slate-800 text-indigo-400" 
           class="flex items-center p-3 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group relative">
           <mat-icon class="material-icons-outlined">account_balance_wallet</mat-icon>
           <span class="ml-3 font-medium hidden lg:block">Assets</span>
           <span class="lg:hidden absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">Assets</span>
        </a>

        <a routerLink="/dashboard/orders" routerLinkActive="bg-slate-800 text-indigo-400" 
           class="flex items-center p-3 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group relative">
           <mat-icon class="material-icons-outlined">receipt_long</mat-icon>
           <span class="ml-3 font-medium hidden lg:block">Orders</span>
           <span class="lg:hidden absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">Orders</span>
        </a>

        <a routerLink="/dashboard/alerts" routerLinkActive="bg-slate-800 text-indigo-400" 
           class="flex items-center p-3 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group relative">
           <mat-icon class="material-icons-outlined">notifications</mat-icon>
           <span class="ml-3 font-medium hidden lg:block">Alerts</span>
           <span class="lg:hidden absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">Alerts</span>
        </a>
      </nav>

      <!-- User Profile (Condensed) -->
      <div class="border-t border-slate-800 p-4">
         <div class="flex items-center justify-center lg:justify-start">
             <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                <mat-icon class="material-icons-outlined">person</mat-icon>
             </div>
             <div class="ml-3 hidden lg:block overflow-hidden">
                 <p class="text-sm font-medium text-white truncate">User</p>
                 <p class="text-xs text-slate-500 truncate">VIP 1</p>
             </div>
         </div>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; height: 100vh; position: sticky; top: 0; }
  `]
})
export class SidebarComponent { }
