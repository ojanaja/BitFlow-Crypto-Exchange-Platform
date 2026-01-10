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

    private marketTrendsSubject = new BehaviorSubject<any>({ gainers: [], losers: [], volume: [] });
    public marketTrends$ = this.marketTrendsSubject.asObservable();

    private allMarketsSubject = new BehaviorSubject<any[]>([]);
    public allMarkets$ = this.allMarketsSubject.asObservable();

    private watchlistSubject = new BehaviorSubject<string[]>([]);
    public watchlist$ = this.watchlistSubject.asObservable();

    private isConnectedSubject = new BehaviorSubject<boolean>(false);
    public isConnected$ = this.isConnectedSubject.asObservable();

    private DEFAULT_WATCHLIST = ['bitcoin', 'ethereum', 'solana', 'ripple', 'cardano', 'dogecoin', 'polkadot', 'chainlink', 'litecoin'];

    constructor(private http: HttpClient) {
        this.loadWatchlist();

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            debug: (str) => {
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = (frame) => {
            console.log('Connected to Market WebSocket');
            this.isConnectedSubject.next(true);

            this.stompClient.subscribe('/topic/prices', (message: Message) => {
                if (message.body) {
                    this.pricesSubject.next(JSON.parse(message.body));
                }
            });

            this.stompClient.subscribe('/topic/market-trends', (message: Message) => {
                if (message.body) {
                    this.marketTrendsSubject.next(JSON.parse(message.body));
                }
            });

            this.stompClient.subscribe('/topic/all-markets', (message: Message) => {
                if (message.body) {
                    this.allMarketsSubject.next(JSON.parse(message.body));
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
            this.isConnectedSubject.next(false);
        };

        this.stompClient.onWebSocketClose = () => {
            console.log('WebSocket connection closed');
            this.isConnectedSubject.next(false);
        };

        this.stompClient.activate();

        this.startFakeTrades();
    }

    private loadWatchlist() {
        const stored = localStorage.getItem('user_watchlist');
        if (stored) {
            try {
                this.watchlistSubject.next(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse watchlist', e);
                this.watchlistSubject.next(this.DEFAULT_WATCHLIST);
            }
        } else {
            this.watchlistSubject.next(this.DEFAULT_WATCHLIST);
        }
    }

    toggleWatchlist(coinId: string) {
        let current = this.watchlistSubject.value;
        const normalizedId = coinId.toLowerCase();

        if (current.includes(normalizedId)) {
            current = current.filter(id => id !== normalizedId);
        } else {
            current = [...current, normalizedId];
        }

        this.watchlistSubject.next(current);
        localStorage.setItem('user_watchlist', JSON.stringify(current));
    }

    isInWatchlist(coinId: string): boolean {
        return this.watchlistSubject.value.includes(coinId.toLowerCase());
    }

    private startFakeTrades() {
        setInterval(() => {
            const currentPrice = 45230.50;
            const isBuy = Math.random() > 0.5;
            const price = currentPrice + (Math.random() - 0.5) * 50;
            const size = Math.random() * 2;

            const trade = {
                price: price,
                size: size,
                side: isBuy ? 'BUY' : 'SELL',
                time: new Date()
            };

            const current = this.recentTradesSubject.value;
            const updated = [trade, ...current].slice(0, 50);
            this.recentTradesSubject.next(updated);

        }, 800 + Math.random() * 1000);
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

        return [];
    }

    getMarketHistory(symbolId: string, interval: string): Observable<any[]> {


        let days = 1;

        switch (interval) {
            case '1M':
            case '15M':
            case '1H':
                days = 1;
                break;
            case '4H':
                days = 7;
                break;
            case '1D':
                days = 30;
                break;
            default:
                days = 1;
        }

        const url = `/api/market/history/${symbolId.toLowerCase()}?days=${days}`;

        return new Observable(observer => {
            this.http.get<any[]>(url).subscribe({
                next: (data) => {
                    observer.next(data || []);
                    observer.complete();
                },
                error: (err) => {
                    console.error('Failed to fetch history from proxy', err);
                    observer.next([]);
                    observer.complete();
                }
            });
        });
    }

    getMarketCandles(symbolId: string, days: string): Observable<any[]> {




        return this.getMarketHistory(symbolId, days);
    }
}
