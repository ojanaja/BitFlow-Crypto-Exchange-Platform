import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WalletService } from './wallet.service';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {

    constructor(private walletService: WalletService) { }

    getPortfolioHistory(): Observable<any[]> {
        return this.walletService.getWallet().pipe(
            map(wallet => {
                const history = [];
                const today = new Date();
                const totalValue = this.calculateTotalValue(wallet);
                let currentValue = totalValue;

                for (let i = 29; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);

                    const variance = (Math.random() - 0.45) * (totalValue * 0.05); 
                    currentValue = (i === 0) ? totalValue : currentValue - variance;

                    history.push({
                        time: date.toISOString().split('T')[0],
                        value: Math.max(0, currentValue)
                    });
                }
                return history;
            })
        );
    }

    getCurrentAllocation(): Observable<any> {
        return this.walletService.getWallet().pipe(
            map(wallet => {
                const labels: string[] = [];
                const data: number[] = [];
                const colors: string[] = [];

                const usd = wallet.assets.find((a: any) => a.symbol === 'USD');
                if (usd && usd.quantity > 0) {
                    labels.push('USD');
                    data.push(usd.quantity);
                    colors.push('#6366f1'); 
                }

                wallet.assets.forEach((asset: any) => {
                    if (asset.symbol !== 'USD' && asset.quantity > 0) {
                        labels.push(asset.symbol);
                        const mockPrice = asset.symbol === 'BTC' ? 45000 : (asset.symbol === 'ETH' ? 2500 : 100);
                        data.push(asset.quantity * mockPrice);

                        colors.push(asset.symbol === 'BTC' ? '#f59e0b' : (asset.symbol === 'ETH' ? '#3b82f6' : '#10b981'));
                    }
                });

                return { labels, data, colors };
            })
        );
    }

    private calculateTotalValue(wallet: any): number {
        let total = 0;
        wallet.assets.forEach((asset: any) => {
            if (asset.symbol === 'USD') {
                total += asset.quantity;
            } else {
                const mockPrice = asset.symbol === 'BTC' ? 45000 : (asset.symbol === 'ETH' ? 2500 : 100);
                total += asset.quantity * mockPrice;
            }
        });
        return total;
    }
}
