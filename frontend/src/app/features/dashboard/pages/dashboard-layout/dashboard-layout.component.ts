import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { MarketService } from '../../../../core/services/market.service';

@Component({
   selector: 'app-dashboard-layout',
   template: `
    <div class="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar class="flex-shrink-0 z-50"></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <!-- Top Header (Optional search/actions) -->
        <header class="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950 flex-shrink-0">
           <!-- Page Title / Breadcrumb Placeholder -->
           <h2 class="text-lg font-semibold text-slate-200">Dashboard</h2>

           <!-- Right Actions -->
           <div class="flex items-center gap-4">
              <div class="hidden sm:flex items-center bg-slate-900 rounded-full px-4 py-1.5 border border-slate-800">
                 <mat-icon class="text-slate-400 text-sm">search</mat-icon>
                 <input type="text" placeholder="Search coin..." class="bg-transparent border-none outline-none text-sm text-white ml-2 w-32 focus:w-48 transition-all placeholder-slate-500">
              </div>
              
              <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
                 Deposit
              </button>
           </div>
        </header>

        <!-- Scrollable Page Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
           <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
   constructor(private marketService: MarketService) { }

   ngOnInit() {
      this.marketService.connect();
   }

   ngOnDestroy() {
      this.marketService.disconnect();
   }
}
