import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-trade-form',
  template: `
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-white text-lg">Execution</h3>
        
        <!-- Market / Limit Toggle -->
        <div class="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
             <button type="button" (click)="setCategory('MARKET')"
                [class.bg-slate-800]="tradeForm.get('category')?.value === 'MARKET'"
                [class.text-white]="tradeForm.get('category')?.value === 'MARKET'"
                class="px-3 py-1 text-xs font-bold rounded text-slate-500 transition-colors">
                Market
             </button>
             <button type="button" (click)="setCategory('LIMIT')"
                [class.bg-slate-800]="tradeForm.get('category')?.value === 'LIMIT'"
                [class.text-white]="tradeForm.get('category')?.value === 'LIMIT'"
                class="px-3 py-1 text-xs font-bold rounded text-slate-500 transition-colors">
                Limit
             </button>
        </div>
      </div>
      
      <form [formGroup]="tradeForm" (ngSubmit)="onSubmit()" class="space-y-4">
        
        <!-- Buy/Sell Tabs -->
        <div class="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg">
            <button type="button" 
                (click)="setOrderType('BUY')"
                [class.bg-emerald-600]="tradeForm.get('type')?.value === 'BUY'"
                [class.text-white]="tradeForm.get('type')?.value === 'BUY'"
                class="py-2 text-sm font-bold rounded-md transition-all text-slate-400 hover:text-white">
                Buy
            </button>
            <button type="button" 
                (click)="setOrderType('SELL')"
                [class.bg-rose-600]="tradeForm.get('type')?.value === 'SELL'"
                [class.text-white]="tradeForm.get('type')?.value === 'SELL'"
                class="py-2 text-sm font-bold rounded-md transition-all text-slate-400 hover:text-white">
                Sell
            </button>
        </div>

        <!-- Symbol Input -->
        <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase">Asset</label>
            <div class="relative">
                <input type="text" formControlName="symbol" [matAutocomplete]="auto"
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-violet-500 transition-colors uppercase placeholder-slate-700">
                <mat-autocomplete #auto="matAutocomplete" class="bg-slate-900 border border-slate-700">
                    <mat-option *ngFor="let coin of ['bitcoin', 'ethereum', 'solana', 'ripple', 'cardano', 'dogecoin', 'polkadot', 'chainlink']" [value]="coin">
                        <span class="text-slate-800 font-bold">{{ coin | titlecase }}</span>
                    </mat-option>
                </mat-autocomplete>
            </div>
        </div>
        
        <!-- Target Price Input (LIMIT only) -->
        <div class="space-y-1" *ngIf="tradeForm.get('category')?.value === 'LIMIT'">
            <label class="text-xs font-bold text-slate-500 uppercase">Target Price</label>
            <div class="relative">
                <input type="number" formControlName="targetPrice" min="0.01" placeholder="0.00"
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white font-mono font-bold focus:outline-none focus:border-violet-500 transition-colors">
                <div class="absolute right-4 top-3 text-slate-500 text-xs font-bold pointer-events-none">
                    USD
                </div>
            </div>
        </div>

        <!-- Quantity Input -->
        <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase">Amount</label>
            <div class="relative">
                <input type="number" formControlName="quantity" min="0.0001" placeholder="0.00"
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white font-mono font-bold focus:outline-none focus:border-violet-500 transition-colors">
                <div class="absolute right-4 top-3 text-slate-500 text-xs font-bold pointer-events-none">
                    UNITS
                </div>
            </div>
        </div>
        
        <!-- Estimated Total (Mock) -->
        <div class="flex justify-between items-center py-2 border-t border-slate-800 mt-2">
            <span class="text-sm text-slate-500">Est. Total</span>
            <span class="font-mono text-white font-bold">~ $0.00</span>
        </div>

        <button type="button" (click)="onSubmit()" 
            [disabled]="tradeForm.invalid || loading"
            class="w-full py-4 rounded-lg font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            [ngClass]="tradeForm.get('type')?.value === 'BUY' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/25' : 'bg-gradient-to-r from-rose-500 to-red-600 hover:shadow-rose-500/25'">
             {{ loading ? 'Processing...' : (tradeForm.get('type')?.value === 'BUY' ? 'Buy ' + (tradeForm.get('symbol')?.value | titlecase) : 'Sell ' + (tradeForm.get('symbol')?.value | titlecase)) }}
        </button>
      </form>
    </div>
  `
})
export class TradeFormComponent {
  tradeForm: FormGroup;
  loading = false;
  @Output() orderPlaced = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {
    this.tradeForm = this.fb.group({
      symbol: ['bitcoin', Validators.required],
      type: ['BUY', Validators.required],
      category: ['MARKET', Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.000001)]],
      targetPrice: [null]
    });

    // Add custom validator for Limit Orders
    this.tradeForm.get('category')?.valueChanges.subscribe(val => {
      if (val === 'LIMIT') {
        this.tradeForm.get('targetPrice')?.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        this.tradeForm.get('targetPrice')?.clearValidators();
      }
      this.tradeForm.get('targetPrice')?.updateValueAndValidity();
    });
  }

  setOrderType(type: 'BUY' | 'SELL') {
    this.tradeForm.patchValue({ type });
  }

  setCategory(category: 'MARKET' | 'LIMIT') {
    this.tradeForm.patchValue({ category });
  }

  onSubmit() {
    if (this.tradeForm.valid) {
      this.loading = true;
      this.orderService.placeOrder(this.tradeForm.value).subscribe({
        next: () => {
          const type = this.tradeForm.get('category')?.value === 'LIMIT' ? 'Limit Order' : 'Market Order';
          this.snackBar.open(`${type} placed successfully!`, 'Close', { duration: 3000 });
          this.loading = false;
          this.tradeForm.get('quantity')?.reset();
          this.tradeForm.get('targetPrice')?.reset();
          this.orderPlaced.emit();
        },
        error: (err) => {
          this.snackBar.open('Failed to place order: ' + (err.error || err.message), 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }
}
