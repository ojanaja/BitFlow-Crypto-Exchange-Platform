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
        };

        this.stompClient.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };
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

    generateHistoricalData(): any[] {
        const data = [];
        let time = new Date().getTime() / 1000 - (24 * 60 * 60 * 30); // 30 days ago
        let price = 45000;

        for (let i = 0; i < 720; i++) { // 30 days * 24h
            const volatility = 0.02; // 2%
            const change = (Math.random() - 0.5) * price * volatility;
            const open = price;
            const close = price + change;
            const high = Math.max(open, close) + Math.random() * price * 0.01;
            const low = Math.min(open, close) - Math.random() * price * 0.01;

            data.push({
                time: time + (i * 3600), // Hourly
                open,
                high,
                low,
                close
            });

            price = close;
        }
        return data;
    }
}
