import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_URL = '/api/prices';
const WS_URL = '/ws-bitflow';

@Injectable({
    providedIn: 'root'
})
export class MarketService {
    private stompClient: Client;
    private pricesSubject = new BehaviorSubject<any>({});
    public prices$ = this.pricesSubject.asObservable();

    private orderBookSubject = new BehaviorSubject<any>(null);
    public orderBook$ = this.orderBookSubject.asObservable();

    private recentTradesSubject = new BehaviorSubject<any[]>([]);
    public recentTrades$ = this.recentTradesSubject.asObservable();

    constructor(private http: HttpClient) {
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = (frame) => {
            console.log('Connected: ' + frame);
            this.stompClient.subscribe('/topic/prices', (message: Message) => {
                if (message.body) {
                    this.pricesSubject.next(JSON.parse(message.body));
                }
            });

            this.stompClient.subscribe('/topic/orderbook', (message: Message) => {
                if (message.body) {
                    this.orderBookSubject.next(JSON.parse(message.body));
                }
            });
        };

        this.stompClient.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        // Start fake trade generator
        this.startFakeTrades();
    }

    private startFakeTrades() {
        setInterval(() => {
            const currentPrice = 45230.50; // Base price
            const isBuy = Math.random() > 0.5;
            const price = currentPrice + (Math.random() - 0.5) * 50;
            const size = Math.random() * 2; // up to 2 BTC

            const trade = {
                price: price,
                size: size,
                side: isBuy ? 'BUY' : 'SELL',
                time: new Date()
            };

            const current = this.recentTradesSubject.value;
            const updated = [trade, ...current].slice(0, 50); // Keep last 50
            this.recentTradesSubject.next(updated);

        }, 800 + Math.random() * 1000); // Random interval 0.8s - 1.8s
    }

    getPrices(): Observable<any> {
        return this.http.get<any>(API_URL);
    }

    connect() {
        this.stompClient.activate();
    }

    disconnect() {
        this.stompClient.deactivate();
    }

    generateHistoricalData(interval: string = '1H'): any[] {
        const data = [];
        let now = new Date().getTime() / 1000;
        let price = 45000;

        let step = 3600; // 1H
        let bars = 720;  // 30 days of hourly

        switch (interval) {
            case '1M':
                step = 60;
                bars = 1440; // 24h
                break;
            case '15M':
                step = 15 * 60;
                bars = 672; // One week
                break;
            case '1H':
                step = 3600;
                bars = 720; // 30 days
                break;
            case '4H':
                step = 3600 * 4;
                bars = 360; // 60 days
                break;
            case '1D':
                step = 86400;
                bars = 365; // 1 year
                break;
            case '1W':
                step = 86400 * 7;
                bars = 104; // 2 years
                break;
        }

        let time = now - (bars * step);

        for (let i = 0; i < bars; i++) {
            const volatility = 0.02 * (Math.sqrt(step / 3600)); // Adjust volatility by timeframe
            const change = (Math.random() - 0.5) * price * volatility;
            const open = price;
            const close = price + change;
            const high = Math.max(open, close) + Math.random() * price * (volatility * 0.5);
            const low = Math.min(open, close) - Math.random() * price * (volatility * 0.5);

            data.push({
                time: time + (i * step),
                open,
                high,
                low,
                close,
                value: close // for Line/Area chart
            });

            price = close;
        }
        return data;
    }
}
