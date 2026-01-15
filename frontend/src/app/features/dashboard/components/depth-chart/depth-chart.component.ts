import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  AreaSeries,
} from 'lightweight-charts';
import { MarketService } from '../../../../core/services/market.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-depth-chart',
  template: `
    <div
      class="h-full w-full bg-white rounded-xl border border-slate-200 p-4 relative flex flex-col shadow-sm"
    >
      <div
        class="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none"
      >
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider"
          >Market Depth</span
        >
      </div>

      <!-- Legend/Tooltip implementation -->
      <div
        class="absolute top-4 right-4 z-10 flex flex-col items-end gap-1 pointer-events-none text-xs"
        *ngIf="legendVisible"
      >
        <div class="flex items-center gap-2">
          <span class="text-emerald-600 font-bold">Bids</span>
          <span class="text-slate-800 font-mono">{{
            currentBidVol | number : '1.0-4'
          }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-rose-500 font-bold">Asks</span>
          <span class="text-slate-800 font-mono">{{
            currentAskVol | number : '1.0-4'
          }}</span>
        </div>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-slate-500">Price</span>
          <span class="text-slate-800 font-mono">{{
            currentPrice | number : '1.2-2'
          }}</span>
        </div>
      </div>

      <div class="flex-1 min-h-0 relative" #chartContainer></div>
    </div>
  `,
})
export class DepthChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() symbol: string = 'BTC';
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  private chart!: IChartApi;
  private bidSeries!: ISeriesApi<'Area'>;
  private askSeries!: ISeriesApi<'Area'>;
  private subscription!: Subscription;
  private resizeObserver: ResizeObserver | null = null;

  // Legend state
  legendVisible = false;
  currentBidVol = 0;
  currentAskVol = 0;
  currentPrice = 0;

  constructor(private marketService: MarketService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initChart();

    // Subscribe to data after chart is ready
    this.subscription = this.marketService.orderBook$.subscribe((orderBook) => {
      if (!orderBook) return;
      this.updateChart(orderBook);
    });
  }

  private initChart() {
    if (!this.chartContainer) return;

    this.chart = createChart(this.chartContainer.nativeElement, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#334155',
      },
      grid: {
        vertLines: { color: '#e2e8f0' },
        horzLines: { color: '#e2e8f0' },
      },
      rightPriceScale: {
        borderColor: '#cbd5e1',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        visible: false,
        borderColor: '#cbd5e1',
      },
      crosshair: {
        vertLine: {
          labelVisible: true,
        },
      },
      localization: {
        priceFormatter: (p: number) => p.toFixed(4),
      },
    });

    this.bidSeries = this.chart.addSeries(AreaSeries, {
      lineColor: '#10b981',
      topColor: 'rgba(16, 185, 129, 0.2)',
      bottomColor: 'rgba(16, 185, 129, 0)',
      lineWidth: 2,
      priceScaleId: 'right',
    });

    this.askSeries = this.chart.addSeries(AreaSeries, {
      lineColor: '#f43f5e',
      topColor: 'rgba(244, 63, 94, 0.2)',
      bottomColor: 'rgba(244, 63, 94, 0)',
      lineWidth: 2,
      priceScaleId: 'right',
    });

    // Tooltip/Legend Update
    this.chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > this.chartContainer.nativeElement.clientWidth ||
        param.point.y < 0 ||
        param.point.y > this.chartContainer.nativeElement.clientHeight
      ) {
        this.legendVisible = false;
      } else {
        this.legendVisible = true;
        const bidData = param.seriesData.get(this.bidSeries) as any;
        const askData = param.seriesData.get(this.askSeries) as any;

        this.currentPrice = param.time as number; // X-axis is price
        this.currentBidVol = bidData ? bidData.value : 0;
        this.currentAskVol = askData ? askData.value : 0;
      }
    });

    this.resizeObserver = new ResizeObserver((entries) => {
      if (
        entries.length === 0 ||
        entries[0].target !== this.chartContainer.nativeElement
      )
        return;
      const newRect = entries[0].contentRect;
      this.chart.applyOptions({ width: newRect.width, height: newRect.height });
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  updateChart(orderBook: any) {
    if (!this.chart || !orderBook.bids.length || !orderBook.asks.length) return;

    // PREPARE DATA
    // We need { time: Price, value: CumulativeVolume }
    // Lightweight charts enforces ASCENDING time.

    // Process Bids: Sort by Price ASC.
    // Bids usually displayed: Low Price -> High Price (Best Bid).
    // Cumulative volume is usually summed from Best Bid (Highest Price) downwards?
    // Or from Lowest Price upwards?
    // Standard Depth Chart:
    // Center is "Mid Price".
    // Bids: Accumulate from Highest Price (Best Bid) down to Lowest Price.
    // Asks: Accumulate from Lowest Price (Best Ask) up to Highest Price.

    // Let's create the points.

    // BIDS
    const bidsSorted = [...orderBook.bids].sort((a, b) => a.price - b.price); // Ascending Price
    // Calculate cumulative volume from Highest Price down to Lowest.
    // Since we iterate Ascending, we need to handle accumulation carefully.
    // Actually, for visualization, Bids curve typically rises as it gets closer to mid price?
    // No, typically it rises as you go AWAY from mid price (providing more "Depth").
    // i.e. At mid price, depth is 0. As you go deeper (lower price for bids), cumulative volume increases.

    // Wait, standard view:
    // Y-axis = Cumulative Volume.
    // X-axis = Price.
    // Bids (Left): As price DECREASES (Leftwards), Volume INCREASES.
    // Asks (Right): As price INCREASES (Rightwards), Volume INCREASES.

    // So for Bids: Sort DESC by Price. Acc Volume.
    // But Chart needs ASC Price for X-axis.
    // So we calculate cumulative first, then sort by price for the chart.

    const bidPoints: any[] = [];
    let bidVol = 0;
    // Sort DESC to accumulate from Best Bid (Highest) downwards
    const bidsDesc = [...orderBook.bids].sort((a, b) => b.price - a.price);
    bidsDesc.forEach((b) => {
      bidVol += b.quantity;
      // Store point
      bidPoints.push({ time: b.price, value: bidVol });
    });
    // Now sort ASC for the chart (Lightweight charts strict requirement)
    bidPoints.sort((a, b) => a.time - b.time);

    // ASKS
    // Sort ASC to accumulate from Best Ask (Lowest) upwards
    const askPoints: any[] = [];
    let askVol = 0;
    const asksAsc = [...orderBook.asks].sort((a, b) => a.price - b.price);
    asksAsc.forEach((a) => {
      askVol += a.quantity;
      askPoints.push({ time: a.price, value: askVol });
    });
    // Already sorted ASC by price

    // SET DATA
    this.bidSeries.setData(bidPoints);
    this.askSeries.setData(askPoints);

    this.chart.timeScale().fitContent();
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.chart) {
      this.chart.remove();
    }
  }
}
