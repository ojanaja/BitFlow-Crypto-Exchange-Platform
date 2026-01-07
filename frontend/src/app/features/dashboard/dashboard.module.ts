import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { PortfolioSummaryComponent } from './components/portfolio-summary/portfolio-summary.component';
import { MarketListComponent } from './components/market-list/market-list.component';
import { TradeFormComponent } from './components/trade-form/trade-form.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { PriceChartComponent } from './components/price-chart/price-chart.component';
import { OrderBookComponent } from './components/order-book/order-book.component';

const routes: Routes = [
    { path: '', component: DashboardHomeComponent }
];

@NgModule({
    declarations: [
        DashboardHomeComponent,
        PortfolioSummaryComponent,
        MarketListComponent,
        TradeFormComponent,
        OrderHistoryComponent,
        PriceChartComponent,
        OrderBookComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSnackBarModule,
        MatAutocompleteModule
    ]
})
export class DashboardModule { }
