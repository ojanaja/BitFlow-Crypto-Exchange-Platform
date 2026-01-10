import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { createChart, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries, LineSeries, AreaSeries } from 'lightweight-charts';
import { MarketService } from '../../../../core/services/market.service';

@Component({
    selector: 'app-price-chart',
    template: `
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-[400px] flex flex-col relative">
      <!-- Header -->
      <div class="flex items-center justify-end p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur z-10 absolute top-0 left-0 right-0 pointer-events-none">
        <!-- Controls (pointer-events-auto needed because parent is none) -->
        <div class="flex gap-2 pointer-events-auto">
            <!-- Timeframe Selector -->
            <div class="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button *ngFor="let tf of ['1M', '15M', '1H', '4H', '1D']" 
                    class="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded transition-colors"
                    [class.bg-slate-800]="tf === activeTimeframe"
                    [class.text-white]="tf === activeTimeframe"
                    [class.text-slate-500]="tf !== activeTimeframe"
                    (click)="setTimeframe(tf)">
                    {{ tf }}
                </button>
            </div>
            
            <!-- Type Selector -->
             <div class="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button *ngFor="let type of ['CANDLES', 'LINE', 'AREA']" 
                    class="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded transition-colors"
                     [class.bg-slate-800]="type === activeType"
                     [class.text-white]="type === activeType"
                     [class.text-slate-500]="type !== activeType"
                    (click)="setChartType(type)">
                    {{ type }}
                </button>
            </div>
        </div>
      </div>

      <!-- Chart Container -->
      <div #chartContainer class="w-full h-full"></div>
    </div>
  `
})
export class PriceChartComponent implements AfterViewInit, OnDestroy, OnChanges {
    @ViewChild('chartContainer') chartContainer!: ElementRef;
    @Input() symbol: string = 'BTC';

    private chart!: IChartApi;
    private series!: ISeriesApi<any>;

    activeTimeframe = '1H';
    activeType: 'CANDLES' | 'LINE' | 'AREA' = 'CANDLES';

    constructor(private marketService: MarketService) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['symbol'] && !changes['symbol'].firstChange) {
            if (this.series) {
                this.loadData();
            }
        }
    }

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

        const chartOptions = {
            layout: {
                background: { color: '#0f172a' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: '#1e293b' },
                horzLines: { color: '#1e293b' },
            },
            crosshair: {
                mode: 1,
            },
            rightPriceScale: {
                borderColor: '#334155',
            },
            timeScale: {
                borderColor: '#334155',
                timeVisible: true,
            },
        };

        this.chart = createChart(this.chartContainer.nativeElement, chartOptions);

        this.createSeries(this.activeType);
        this.loadData();

        new ResizeObserver(entries => {
            if (entries.length === 0 || entries[0].target !== this.chartContainer.nativeElement) { return; }
            const newRect = entries[0].contentRect;
            this.chart.applyOptions({ width: newRect.width, height: newRect.height });
        }).observe(this.chartContainer.nativeElement);
    }

    setTimeframe(tf: string) {
        this.activeTimeframe = tf;
        this.loadData();
    }

    setChartType(type: any) {
        if (this.activeType === type) return;
        this.activeType = type;

        if (this.series) {
            this.chart.removeSeries(this.series);
        }

        this.createSeries(type);
        this.loadData();
    }

    private createSeries(type: string) {
        if (type === 'CANDLES') {
            this.series = this.chart.addSeries(CandlestickSeries, {
                upColor: '#10b981',
                downColor: '#f43f5e',
                borderUpColor: '#10b981',
                borderDownColor: '#f43f5e',
                wickUpColor: '#10b981',
                wickDownColor: '#f43f5e',
            });
        } else if (type === 'LINE') {
            this.series = this.chart.addSeries(LineSeries, {
                color: '#8b5cf6',
                lineWidth: 2
            });
        } else if (type === 'AREA') {
            this.series = this.chart.addSeries(AreaSeries, {
                lineColor: '#8b5cf6',
                topColor: 'rgba(139, 92, 246, 0.4)',
                bottomColor: 'rgba(139, 92, 246, 0)',
            });
        }
    }

    private loadData() {
        this.marketService.getMarketHistory(this.symbol, this.activeTimeframe).subscribe(data => {
            if (this.series) {
                this.series.setData(data);
                this.chart.timeScale().fitContent();
            }
        });
    }
}
