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
            // brokerURL: 'ws://localhost:8080/ws-bitflow', // If using raw WS
            webSocketFactory: () => new SockJS(WS_URL), // For SockJS fallback
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
}
