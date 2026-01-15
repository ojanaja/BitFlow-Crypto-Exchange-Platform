import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import {
  createChart,
  ColorType,
  ISeriesApi,
  AreaSeries,
} from 'lightweight-charts';

@Component({
  selector: 'app-analytics',
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <!-- Asset Allocation (Donut) -->
      <mat-card
        class="!bg-slate-900 !text-white !rounded-xl !border !border-slate-800 !shadow-lg"
      >
        <mat-card-header>
          <mat-card-title class="!text-lg !font-bold"
            >Asset Allocation</mat-card-title
          >
        </mat-card-header>
        <mat-card-content
          class="flex flex-col justify-center items-center p-6 min-h-[300px]"
        >
          <div class="relative w-[200px] h-[200px]">
            <svg
              viewBox="0 0 100 100"
              class="w-full h-full transform -rotate-90"
            >
              <ng-container
                *ngFor="let slice of donutSlices; trackBy: trackByLabel"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  [attr.stroke]="slice.color"
                  [attr.stroke-width]="20"
                  [attr.stroke-dasharray]="slice.dashArray"
                  [attr.stroke-dashoffset]="slice.dashOffset"
                  class="transition-all duration-500 hover:opacity-80"
                >
                  <title>{{ slice.label }}: {{ slice.percentage }}%</title>
                </circle>
              </ng-container>
              <!-- Center Text/Hole -->
              <circle cx="50" cy="50" r="30" fill="#0f172a"></circle>
            </svg>
            <!-- Center Overlay -->
            <div
              class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <span class="text-xs text-slate-400">Total Assets</span>
              <span class="font-bold text-slate-200">{{
                donutSlices.length
              }}</span>
            </div>
          </div>

          <!-- Legend -->
          <div class="mt-6 w-full grid grid-cols-2 gap-2 text-xs">
            <div
              *ngFor="let item of donutSlices"
              class="flex items-center gap-2"
            >
              <div
                class="w-3 h-3 rounded-full"
                [style.backgroundColor]="item.color"
              ></div>
              <span class="text-slate-300">{{ item.label }}</span>
              <span class="text-slate-500 ml-auto">{{ item.percentage }}%</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Portfolio History (Line) -->
      <mat-card
        class="!bg-slate-900 !text-white !rounded-xl !border !border-slate-800 !shadow-lg"
      >
        <mat-card-header>
          <mat-card-title class="!text-lg !font-bold"
            >Portfolio Growth (30D)</mat-card-title
          >
        </mat-card-header>
        <mat-card-content class="p-4">
          <div
            #chartContainer
            class="w-full h-[300px] rounded-lg overflow-hidden"
          ></div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  // Donut Chart State
  donutSlices: {
    label: string;
    color: string;
    percentage: number;
    dashArray: string;
    dashOffset: number;
  }[] = [];

  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private lineChart: any;
  private lineSeries!: ISeriesApi<'Area'>;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.analyticsService.getCurrentAllocation().subscribe((data) => {
      if (data && data.data.length > 0) {
        this.calculateDonutSlices(data);
      }
    });
  }

  trackByLabel(index: number, item: any) {
    return item.label;
  }

  private calculateDonutSlices(data: {
    labels: string[];
    data: number[];
    colors: string[];
  }) {
    const total = data.data.reduce((acc, val) => acc + val, 0);
    let currentOffset = 0;
    const radius = 40; // matches svg r=40
    const circumference = 2 * Math.PI * radius;

    this.donutSlices = data.data.map((value, index) => {
      const percentage = (value / total) * 100;
      const arcLength = (percentage / 100) * circumference;

      // stroke-dasharray: length of arc, length of gap (rest of circle)
      // stroke-dashoffset: starting point
      // dashArray = `${arcLength} ${circumference}`
      // However, for multiple segments, we need to offset correctly.
      // Actually, the easiest way with single circle overlay is:
      // stroke-dasharray = "arcLength circumference"
      // stroke-dashoffset = -currentOffset

      const slice = {
        label: data.labels[index],
        color: data.colors[index],
        percentage: Math.round(percentage),
        dashArray: `${arcLength} ${circumference}`,
        dashOffset: -currentOffset,
      };

      currentOffset += arcLength;
      return slice;
    });
  }

  ngAfterViewInit() {
    this.initLineChart();
    this.analyticsService.getPortfolioHistory().subscribe((history) => {
      if (this.lineSeries && history) {
        this.lineSeries.setData(history);
        this.lineChart.timeScale().fitContent();
      }
    });
  }

  private initLineChart() {
    if (!this.chartContainer) return;

    this.lineChart = createChart(this.chartContainer.nativeElement, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      timeScale: {
        borderColor: '#334155',
      },
    });

    this.lineSeries = this.lineChart.addSeries(AreaSeries, {
      lineColor: '#8b5cf6',
      topColor: 'rgba(139, 92, 246, 0.4)',
      bottomColor: 'rgba(139, 92, 246, 0)',
    });

    new ResizeObserver((entries) => {
      if (
        entries.length === 0 ||
        entries[0].target !== this.chartContainer.nativeElement
      ) {
        return;
      }
      const newRect = entries[0].contentRect;
      this.lineChart.applyOptions({
        width: newRect.width,
        height: newRect.height,
      });
    }).observe(this.chartContainer.nativeElement);
  }
}
