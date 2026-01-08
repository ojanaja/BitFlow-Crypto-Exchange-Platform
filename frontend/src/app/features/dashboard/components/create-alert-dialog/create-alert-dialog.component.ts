import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertsService } from '../../../../core/services/alerts.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-create-alert-dialog',
    template: `
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl min-w-[350px]">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-white text-lg">Create Price Alert</h3>
        <button (click)="close()" class="text-slate-400 hover:text-white transition-colors">✕</button>
      </div>

      <div class="space-y-4">
        <!-- Symbol -->
        <div class="space-y-1">
             <label class="text-xs font-bold text-slate-500 uppercase">Asset</label>
             <select [(ngModel)]="symbol" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500">
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
             </select>
        </div>

        <!-- Condition -->
        <div class="space-y-1">
             <label class="text-xs font-bold text-slate-500 uppercase">Condition</label>
             <div class="flex gap-2">
                <button (click)="condition = 'ABOVE'" 
                    [class]="condition === 'ABOVE' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'"
                    class="flex-1 py-2 rounded-lg font-bold text-sm transition-colors border border-transparent">
                    Price > Target
                </button>
                <button (click)="condition = 'BELOW'" 
                    [class]="condition === 'BELOW' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'"
                    class="flex-1 py-2 rounded-lg font-bold text-sm transition-colors border border-transparent">
                    Price < Target
                </button>
             </div>
        </div>

        <!-- Target Price -->
        <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase">Target Price ($)</label>
            <input type="number" [(ngModel)]="targetPrice" placeholder="45000"
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white font-mono font-bold focus:outline-none focus:border-violet-500">
        </div>

        <button (click)="submit()" 
            [disabled]="!targetPrice || loading"
            class="w-full py-3 rounded-lg font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-lg transition-all mt-4 disabled:opacity-50">
             {{ loading ? 'Creating...' : 'Set Alert' }}
        </button>
      </div>
    </div>
  `
})
export class CreateAlertDialogComponent {
    symbol = 'BTC';
    condition: 'ABOVE' | 'BELOW' = 'ABOVE';
    targetPrice: number | null = null;
    loading = false;

    constructor(
        public dialogRef: MatDialogRef<CreateAlertDialogComponent>,
        private alertsService: AlertsService,
        private snackBar: MatSnackBar
    ) { }

    close() { this.dialogRef.close(); }

    submit() {
        if (this.targetPrice) {
            this.loading = true;
            this.alertsService.createAlert(this.symbol, this.targetPrice, this.condition).subscribe({
                next: () => {
                    this.snackBar.open('Alert created!', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.snackBar.open('Failed: ' + err.message, 'Close', { duration: 3000 });
                    this.loading = false;
                }
            });
        }
    }
}
