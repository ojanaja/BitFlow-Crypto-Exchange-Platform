import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { createChart, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { MarketService } from '../../../../core/services/market.service';

@Component({
    selector: 'app-price-chart',
    template: `
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-[400px] flex flex-col relative">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur z-10 absolute top-0 left-0 right-0">
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                    ₿
                </div>
                <div>
                    <h3 class="font-bold text-white leading-none">BTC/USD</h3>
                    <div class="text-xs text-slate-400">Bitcoin</div>
                </div>
            </div>
            <div class="h-8 w-px bg-slate-800 mx-2"></div>
            <div class="flex gap-4 text-sm font-mono">
                <div>
                    <span class="text-slate-500 block text-[10px] uppercase">Last Price</span>
                    <span class="text-emerald-400 font-bold">$45,230.50</span>
                </div>
                <div>
                    <span class="text-slate-500 block text-[10px] uppercase">24h Change</span>
                    <span class="text-emerald-500 font-bold">+2.45%</span>
                </div>
                <div>
                    <span class="text-slate-500 block text-[10px] uppercase">24h Low</span>
                    <span class="text-slate-300">$44,100.00</span>
                </div>
                <div>
                    <span class="text-slate-500 block text-[10px] uppercase">24h High</span>
                    <span class="text-slate-300">$46,500.00</span>
                </div>
            </div>
        </div>
        
        <!-- Timeframe Selector -->
        <div class="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button *ngFor="let tf of ['1H', '4H', '1D', '1W']" 
                class="px-3 py-1 text-xs font-bold rounded transition-colors"
                [class.bg-slate-800]="tf === activeTimeframe"
                [class.text-white]="tf === activeTimeframe"
                [class.text-slate-500]="tf !== activeTimeframe"
                (click)="activeTimeframe = tf">
                {{ tf }}
            </button>
        </div>
      </div>

      <!-- Chart Container -->
      <div #chartContainer class="w-full h-full"></div>
    </div>
  `
})
export class PriceChartComponent implements AfterViewInit, OnDestroy {
    @ViewChild('chartContainer') chartContainer!: ElementRef;

    private chart!: IChartApi;
    private stickSeries!: ISeriesApi<'Candlestick'>;
    activeTimeframe = '1H';

    constructor(private marketService: MarketService) { }

    ngAfterViewInit() {
        this.initChart();
    }

    ngOnDestroy() {
        if (this.chart) {
            this.chart.remove();
        }
    }

    private initChart() {
        if (!this.chartContainer) return;

        // Dark Theme Colors
        const chartOptions = {
            layout: {
                background: { color: '#0f172a' }, // slate-900
                textColor: '#94a3b8', // slate-400
            },
            grid: {
                vertLines: { color: '#1e293b' }, // slate-800
                horzLines: { color: '#1e293b' },
            },
            crosshair: {
                mode: 1, // CrosshairMode.Normal
            },
            rightPriceScale: {
                borderColor: '#334155', // slate-700
            },
            timeScale: {
                borderColor: '#334155',
                timeVisible: true,
            },
        };

        this.chart = createChart(this.chartContainer.nativeElement, chartOptions);

        this.stickSeries = this.chart.addSeries(CandlestickSeries, {
            upColor: '#10b981', // emerald-500
            downColor: '#f43f5e', // rose-500
            borderUpColor: '#10b981',
            borderDownColor: '#f43f5e',
            wickUpColor: '#10b981',
            wickDownColor: '#f43f5e',
        });

        const data = this.marketService.generateHistoricalData();
        this.stickSeries.setData(data);

        // Responsive Resize
        new ResizeObserver(entries => {
            if (entries.length === 0 || entries[0].target !== this.chartContainer.nativeElement) { return; }
            const newRect = entries[0].contentRect;
            this.chart.applyOptions({ width: newRect.width, height: newRect.height });
        }).observe(this.chartContainer.nativeElement);
    }
}
