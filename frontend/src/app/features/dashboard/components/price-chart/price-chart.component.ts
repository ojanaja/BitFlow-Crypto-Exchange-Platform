import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
} from 'lightweight-charts';
import { MarketService } from '../../../../core/services/market.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-price-chart',
  template: `
    <div
      class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[400px] flex flex-col relative"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-end p-4 border-b border-slate-200 bg-white/90 backdrop-blur z-10 absolute top-0 left-0 right-0 pointer-events-none"
      >
        <!-- Controls (pointer-events-auto needed because parent is none) -->
        <div class="flex gap-2 pointer-events-auto">
          <!-- Timeframe Selector -->
          <div class="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              *ngFor="let tf of ['1M', '15M', '1H', '4H', '1D']"
              class="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded transition-colors"
              [class.bg-white]="tf === activeTimeframe"
              [class.text-emerald-700]="tf === activeTimeframe"
              [class.shadow-sm]="tf === activeTimeframe"
              [class.text-slate-500]="tf !== activeTimeframe"
              (click)="setTimeframe(tf)"
            >
              {{ tf }}
            </button>
          </div>

          <!-- Type Selector -->
          <div class="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              *ngFor="let type of ['CANDLES', 'LINE', 'AREA']"
              class="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded transition-colors"
              [class.bg-white]="type === activeType"
              [class.text-emerald-700]="type === activeType"
              [class.shadow-sm]="type === activeType"
              [class.text-slate-500]="type !== activeType"
              (click)="setChartType(type)"
            >
              {{ type }}
            </button>
          </div>
        </div>
      </div>

      <!-- Chart Container -->
      <div #chartContainer class="w-full h-full"></div>
    </div>
  `,
})
export class PriceChartComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @Input() symbol: string = 'BTC';

  private chart!: IChartApi;
  private series!: ISeriesApi<any>;
  private resizeObserver: ResizeObserver | null = null;
  private cachedData: any[] = [];
  private destroy$ = new Subject<void>();
  private isLoading = false;

  activeTimeframe = '1H';
  activeType: 'CANDLES' | 'LINE' | 'AREA' = 'CANDLES';

  constructor(private marketService: MarketService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['symbol'] && !changes['symbol'].firstChange) {
      if (this.chart) {
        this.loadData();
      }
    }
  }

  ngAfterViewInit() {
    // delay slightly to ensure container is ready
    requestAnimationFrame(() => {
      this.initChart();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.chart) {
      this.chart.remove();
    }
  }

  private initChart() {
    if (!this.chartContainer) return;

    const chartOptions = {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#334155',
      },
      grid: {
        vertLines: { color: '#e2e8f0' },
        horzLines: { color: '#e2e8f0' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#cbd5e1',
      },
      timeScale: {
        borderColor: '#cbd5e1',
        timeVisible: true,
      },
    };

    this.chart = createChart(this.chartContainer.nativeElement, chartOptions);

    // Create initial series
    this.createSeries(this.activeType);

    // Load initial data
    this.loadData();

    // Setup resize observer
    this.resizeObserver = new ResizeObserver((entries) => {
      if (
        !this.chartContainer ||
        entries.length === 0 ||
        entries[0].target !== this.chartContainer.nativeElement
      ) {
        return;
      }
      const newRect = entries[0].contentRect;
      this.chart.applyOptions({ width: newRect.width, height: newRect.height });
    });

    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  setTimeframe(tf: string) {
    if (this.activeTimeframe === tf) return;
    this.activeTimeframe = tf;
    this.loadData();
  }

  setChartType(type: any) {
    if (this.activeType === type) return;
    this.activeType = type;

    // Remove old series
    if (this.series) {
      this.chart.removeSeries(this.series);
    }

    // Create new series
    this.createSeries(type);

    // Render from cache synchronously - no network needed
    this.renderData();
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
        lineWidth: 2,
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
    this.isLoading = true;

    this.marketService
      .getMarketHistory(this.symbol, this.activeTimeframe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any[]) => {
          this.isLoading = false;
          if (data && data.length > 0) {
            // 1. Sanitize and Sort ONCE
            this.cachedData = data
              .filter(
                (item) => item && item.time !== undefined && item.time !== null
              )
              .map((item) => {
                // Ensure time is a UNIX timestamp number if possible, or keep as string if that's what backend sends
                const time =
                  typeof item.time === 'string'
                    ? new Date(item.time).getTime() / 1000
                    : item.time;
                return { ...item, time: time as any };
              })
              .sort((a, b) => (a.time as number) - (b.time as number));

            // Deduplicate
            const uniqueData = [];
            const seenTimes = new Set();
            for (const item of this.cachedData) {
              if (!seenTimes.has(item.time)) {
                seenTimes.add(item.time);
                uniqueData.push(item);
              }
            }
            this.cachedData = uniqueData;

            this.renderData();
            this.chart.timeScale().fitContent();
          } else {
            this.cachedData = [];
            // Handle empty state if needed
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Failed to load chart data', err);
        },
      });
  }

  private renderData() {
    if (!this.series || !this.cachedData.length) return;

    try {
      if (this.activeType === 'CANDLES') {
        const validCandles = this.cachedData.filter(
          (d) =>
            d.open !== undefined &&
            d.high !== undefined &&
            d.low !== undefined &&
            d.close !== undefined
        );
        this.series.setData(validCandles);
      } else {
        const lineData = this.cachedData.map((item) => ({
          time: item.time,
          value: item.close !== undefined ? item.close : 0,
        }));
        this.series.setData(lineData);
      }
    } catch (e) {
      console.error('Error rendering chart data', e);
    }
  }
}
