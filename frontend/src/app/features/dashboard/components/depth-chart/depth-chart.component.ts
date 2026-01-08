import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MarketService } from '../../../../core/services/market.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-depth-chart',
    template: `
    <div class="h-full w-full bg-slate-900 rounded-xl border border-slate-800 p-4 relative flex flex-col">
        <div class="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Market Depth</span>
        </div>
        
        <div class="flex-1 min-h-0">
            <canvas baseChart
                [data]="lineChartData"
                [options]="lineChartOptions"
                [type]="lineChartType">
            </canvas>
        </div>
    </div>
  `
})
export class DepthChartComponent implements OnInit, OnDestroy {
    @Input() symbol: string = 'BTC';
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

    subscription!: Subscription;

    public lineChartData: ChartConfiguration['data'] = {
        datasets: [
            {
                data: [],
                label: 'Bids',
                backgroundColor: 'rgba(16, 185, 129, 0.2)', // Emerald-500/20
                borderColor: '#10b981',
                pointRadius: 0,
                fill: 'origin',
                tension: 0.1
            },
            {
                data: [],
                label: 'Asks',
                backgroundColor: 'rgba(244, 63, 94, 0.2)', // Rose-500/20
                borderColor: '#f43f5e',
                pointRadius: 0,
                fill: 'origin',
                tension: 0.1
            }
        ],
        labels: []
    };

    public lineChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#1e293b',
                titleColor: '#e2e8f0',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                type: 'linear',
                display: true,
                grid: { color: '#1e293b' },
                ticks: { color: '#64748b' }
            },
            y: {
                display: true,
                position: 'right',
                grid: { color: '#1e293b' },
                ticks: { color: '#64748b' }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    public lineChartType: ChartType = 'line';

    constructor(private marketService: MarketService) { }

    ngOnInit() {
        this.subscription = this.marketService.orderBook$.subscribe(orderBook => {
            if (!orderBook) return;
            this.updateChart(orderBook);
        });
    }

    updateChart(orderBook: any) {
        if (!orderBook.bids.length || !orderBook.asks.length) return;

        // Process Bids: Sort DESC by price. Cumulative Volume.
        // We want the chart to go from Low Price -> Mid Price -> High Price
        // Bids (Buy) are below mid price. Asks (Sell) are above.

        // Sort Bids Ascending for the X axis (Cheap -> Expensive)
        const bidsSorted = [...orderBook.bids].sort((a, b) => a.price - b.price);
        // Sort Asks Ascending for the X axis
        const asksSorted = [...orderBook.asks].sort((a, b) => a.price - b.price);

        // Calculate Cumulative for Bids (Reverse accumulation for display? 
        // Usually depth chart is: 
        // Left side (Bids): Cumulative volume increases as price decreases (going left from mid).
        // Right side (Asks): Cumulative volume increases as price increases (going right from mid).

        // Let's simplified version: Plot Price (X) vs Cumulative Volume (Y).

        const bidPoints: { x: number, y: number }[] = [];
        let bidVol = 0;
        // For bids, standard depth chart accumulates from highest bid downwards.
        // Price X axis: Low .... High (Mid) .... High
        // So for a standard X axis (Price increasing), Bids are on the left.
        // We accumulate volume starting from the "Heighest Bid" (closest to mid) and going down.

        const bidsDesc = [...orderBook.bids].sort((a, b) => b.price - a.price);
        bidsDesc.forEach(b => {
            bidVol += b.quantity;
            bidPoints.push({ x: b.price, y: bidVol });
        });
        // Need to reverse points so X is increasing
        bidPoints.reverse();

        const askPoints: { x: number, y: number }[] = [];
        let askVol = 0;
        // Start from lowest ask (closest to mid)
        const asksAsc = [...orderBook.asks].sort((a, b) => a.price - b.price);
        asksAsc.forEach(a => {
            askVol += a.quantity;
            askPoints.push({ x: a.price, y: askVol });
        });

        this.lineChartData.datasets[0].data = bidPoints;
        this.lineChartData.datasets[1].data = askPoints;

        this.chart?.update();
    }

    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
    }
}
