import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { WalletService } from '../../../../core/services/wallet.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-withdraw-dialog',
  template: `
    <div
      class="bg-white border border-slate-200 rounded-xl p-6 shadow-xl min-w-[350px]"
    >
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-slate-900 text-lg">Withdraw Funds</h3>
        <button
          (click)="close()"
          class="text-slate-400 hover:text-slate-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Amount Input -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-500 uppercase"
            >Amount (USD)</label
          >
          <div class="relative">
            <span class="absolute left-4 top-3 text-slate-900 font-bold"
              >$</span
            >
            <input
              type="number"
              [(ngModel)]="amount"
              min="1"
              placeholder="0.00"
              class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-4 py-3 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <!-- Quick Add Buttons -->
        <div class="grid grid-cols-3 gap-2">
          <button
            *ngFor="let val of [1000, 5000, 10000]"
            (click)="amount = val"
            class="py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-xs font-bold text-rose-500 border border-slate-200 transition-colors"
          >
            +$ {{ val | number }}
          </button>
        </div>

        <button
          (click)="submit()"
          [disabled]="!amount || amount <= 0 || loading"
          class="w-full py-3 rounded-lg font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-md transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Processing...' : 'Confirm Withdrawal' }}
        </button>
      </div>
    </div>
  `,
})
export class WithdrawDialogComponent {
  amount: number | null = null;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<WithdrawDialogComponent>,
    private walletService: WalletService,
    private snackBar: MatSnackBar
  ) {}

  close() {
    this.dialogRef.close();
  }

  submit() {
    if (this.amount && this.amount > 0) {
      this.loading = true;
      this.walletService.withdraw(this.amount).subscribe({
        next: () => {
          this.snackBar.open(`Successfully withdrew $${this.amount}`, 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open(
            'Withdrawal failed: ' +
              (err.error?.message || err.message || 'Unknown error'),
            'Close',
            { duration: 3000 }
          );
          this.loading = false;
        },
      });
    }
  }
}
