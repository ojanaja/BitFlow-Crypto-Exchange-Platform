import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardLayoutComponent } from './pages/dashboard-layout/dashboard-layout.component';
import { OverviewPageComponent } from './pages/overview/overview.component';
import { MarketPageComponent } from './pages/market-page/market-page.component';
import { TradePageComponent } from './pages/trade-page/trade-page.component';
import { AssetsPageComponent } from './pages/assets-page/assets-page.component';
import { OrdersPageComponent } from './pages/orders-page/orders-page.component';

import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { PortfolioSummaryComponent } from './components/portfolio-summary/portfolio-summary.component';
import { MarketListComponent } from './components/market-list/market-list.component';
import { TradeFormComponent } from './components/trade-form/trade-form.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { PriceChartComponent } from './components/price-chart/price-chart.component';
import { OrderBookComponent } from './components/order-book/order-book.component';
import { DepositDialogComponent } from './components/deposit-dialog/deposit-dialog.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { CreateAlertDialogComponent } from './components/create-alert-dialog/create-alert-dialog.component';
import { DepthChartComponent } from './components/depth-chart/depth-chart.component';
import { WithdrawDialogComponent } from './components/withdraw-dialog/withdraw-dialog.component';


@NgModule({
    declarations: [
        DashboardHomeComponent,
        PortfolioSummaryComponent,
        MarketListComponent,
        TradeFormComponent,
        OrderHistoryComponent,
        PriceChartComponent,
        OrderBookComponent,
        DepositDialogComponent,
        AnalyticsComponent,
        AlertsComponent,
        CreateAlertDialogComponent,
        DepthChartComponent,
        SidebarComponent,
        DashboardLayoutComponent,
        OverviewPageComponent,
        MarketPageComponent,
        TradePageComponent,
        AssetsPageComponent,
        OrdersPageComponent,
        WithdrawDialogComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgChartsModule,
        DashboardRoutingModule,
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSnackBarModule,
        MatAutocompleteModule,
        MatDialogModule,
        MatIconModule,
        MatTooltipModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class DashboardModule { }
