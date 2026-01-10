import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MarketService } from '../../../../core/services/market.service';
import { SolanaService } from '../../../../core/services/solana.service';
import { AuthService } from '../../../../core/services/auth.service';

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
              <!-- Search removed for brevity/mobile fit -->
              
              <div *ngIf="walletAddress" class="hidden md:flex items-center gap-2 text-sm bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span class="text-slate-400">Wallet:</span>
                  <span class="text-slate-200 font-mono">{{ shortenAddress(walletAddress) }}</span>
                  <span *ngIf="balance !== null" class="text-green-400 ml-2 font-medium border-l border-slate-700 pl-2">{{ balance | number:'1.2-4' }} SOL</span>
              </div>

              <button (click)="logout()" class="hover:bg-red-900/20 text-red-400 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-900/30">
                 Disconnect
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
   walletAddress: string | null = null;
   balance: number | null = null;

   constructor(
      private marketService: MarketService,
      private solanaService: SolanaService,
      private authService: AuthService
   ) { }

   ngOnInit() {
      this.marketService.connect();

      this.solanaService.walletAddress$.subscribe(address => {
         this.walletAddress = address;
         if (address) {
            this.fetchBalance(address);
         }
      });

      if (!this.walletAddress) {
         const stored = localStorage.getItem('walletAddress');
         if (stored) {
            this.walletAddress = stored;
            this.fetchBalance(stored);
         }
      }
   }

   async fetchBalance(address: string) {
      this.balance = await this.solanaService.getBalance(address);
   }

   shortenAddress(address: string): string {
      if (!address) return '';
      return address.slice(0, 4) + '...' + address.slice(-4);
   }

   logout() {
      this.solanaService.disconnect();
      this.authService.logout();
   }

   ngOnDestroy() {
      this.marketService.disconnect();
   }
}
