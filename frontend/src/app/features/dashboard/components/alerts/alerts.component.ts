import { Component, OnInit } from '@angular/core';
import { AlertsService } from '../../../../core/services/alerts.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateAlertDialogComponent } from '../create-alert-dialog/create-alert-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-alerts',
    template: `
    <div class="h-full flex flex-col gap-4">
        <div class="flex justify-between items-center">
            <h3 class="text-white font-bold text-lg">Price Alerts</h3>
            <button mat-stroked-button color="primary" class="!border-violet-600 !text-violet-400" (click)="openCreateDialog()">
                + Create Alert
            </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-2">
            <div *ngFor="let alert of alerts" class="bg-slate-900 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                     <div class="flex items-center gap-2">
                        <span class="font-bold text-white">{{ alert.symbol }}</span>
                        <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">{{ alert.condition }}</span>
                     </div>
                     <div class="text-sm text-slate-400 mt-1">Target: $ {{ alert.targetPrice | number }}</div>
                </div>
                <div>
                    <span *ngIf="alert.status === 'ACTIVE'" class="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">ACTIVE</span>
                    <span *ngIf="alert.status === 'TRIGGERED'" class="text-xs font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded">TRIGGERED</span>
                </div>
            </div>
            
            <div *ngIf="alerts.length === 0" class="text-center py-10 text-slate-500 text-sm">
                No active alerts. Create one to get notified!
            </div>
        </div>
    </div>
  `
})
export class AlertsComponent implements OnInit {
    alerts: any[] = [];

    constructor(
        private alertsService: AlertsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.loadAlerts();

        this.alertsService.alertTriggered$.subscribe(alert => {
            this.snackBar.open(alert.message, 'Dismiss', { duration: 5000, verticalPosition: 'top' });
            this.loadAlerts(); 
        });
    }

    loadAlerts() {
        this.alertsService.getAlerts().subscribe(data => this.alerts = data);
    }

    openCreateDialog() {
        const dialogRef = this.dialog.open(CreateAlertDialogComponent, {
            width: '400px',
            panelClass: 'bg-transparent'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) this.loadAlerts();
        });
    }
}
