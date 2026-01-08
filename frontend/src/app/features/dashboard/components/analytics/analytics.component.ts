import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { createChart, ColorType } from 'lightweight-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
    selector: 'app-analytics',
    template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <!-- Asset Allocation (Pie) -->
        <mat-card class="!bg-slate-900 !text-white !rounded-xl !border !border-slate-800 !shadow-lg">
            <mat-card-header>
                <mat-card-title class="!text-lg !font-bold">Asset Allocation</mat-card-title>
            </mat-card-header>
            <mat-card-content class="flex justify-center items-center p-6 min-h-[300px]">
                <div class="w-full max-w-[300px]">
                    <canvas baseChart
                        [data]="pieChartData"
                        [options]="pieChartOptions"
                        [type]="pieChartType"
                        [plugins]="pieChartPlugins">
                    </canvas>
                </div>
            </mat-card-content>
        </mat-card>

        <!-- Portfolio History (Line) -->
        <mat-card class="!bg-slate-900 !text-white !rounded-xl !border !border-slate-800 !shadow-lg">
            <mat-card-header>
                <mat-card-title class="!text-lg !font-bold">Portfolio Growth (30D)</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4">
                <div #chartContainer class="w-full h-[300px] rounded-lg overflow-hidden"></div>
            </mat-card-content>
        </mat-card>
    </div>
  `
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
    public pieChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: { color: '#94a3b8' }
            }
        },
        borderColor: '#0f172a'
    };
    public pieChartType: ChartType = 'doughnut';
    public pieChartPlugins = [];
    public pieChartData: ChartData<'doughnut', number[], string | string[]> = {
        labels: ['Loading...'],
        datasets: [{ data: [100], backgroundColor: ['#334155'] }]
    };

    @ViewChild('chartContainer') chartContainer!: ElementRef;
    private lineChart: any;
    private lineSeries: any;

    constructor(private analyticsService: AnalyticsService) { }

    ngOnInit() {
        this.analyticsService.getCurrentAllocation().subscribe(data => {
            this.pieChartData = {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: data.colors,
                    hoverOffset: 4,
                    borderWidth: 0
                }]
            };
        });
    }

    ngAfterViewInit() {
        this.initLineChart();
        this.analyticsService.getPortfolioHistory().subscribe(history => {
            this.lineSeries.setData(history);
            this.lineChart.timeScale().fitContent();
        });
    }

    private initLineChart() {
        if (!this.chartContainer) return;

        this.lineChart = createChart(this.chartContainer.nativeElement, {
            layout: {
                background: { type: ColorType.Solid, color: '#0f172a' },
                textColor: '#94a3b8'
            },
            grid: {
                vertLines: { color: '#1e293b' },
                horzLines: { color: '#1e293b' }
            },
            rightPriceScale: {
                borderColor: '#334155'
            },
            timeScale: {
                borderColor: '#334155'
            }
        });

        this.lineSeries = this.lineChart.addAreaSeries({
            lineColor: '#8b5cf6', 
            topColor: 'rgba(139, 92, 246, 0.4)',
            bottomColor: 'rgba(139, 92, 246, 0)'
        });

        new ResizeObserver(entries => {
            if (entries.length === 0 || entries[0].target !== this.chartContainer.nativeElement) { return; }
            const newRect = entries[0].contentRect;
            this.lineChart.applyOptions({ width: newRect.width, height: newRect.height });
        }).observe(this.chartContainer.nativeElement);
    }
}
