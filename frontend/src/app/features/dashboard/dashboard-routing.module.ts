import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './pages/dashboard-layout/dashboard-layout.component';
import { OverviewPageComponent } from './pages/overview/overview.component';
import { MarketPageComponent } from './pages/market-page/market-page.component';
import { TradePageComponent } from './pages/trade-page/trade-page.component';
import { AssetsPageComponent } from './pages/assets-page/assets-page.component';
import { OrdersPageComponent } from './pages/orders-page/orders-page.component';
import { AlertsComponent } from './components/alerts/alerts.component';

const routes: Routes = [
    {
        path: '',
        component: DashboardLayoutComponent,
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: OverviewPageComponent },
            { path: 'markets', component: MarketPageComponent },
            { path: 'trade/:symbol', component: TradePageComponent },
            { path: 'assets', component: AssetsPageComponent },
            { path: 'orders', component: OrdersPageComponent },
            { path: 'alerts', component: AlertsComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
