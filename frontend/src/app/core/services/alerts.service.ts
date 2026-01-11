import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client, Message } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { AuthService } from './auth.service';

const API_URL = '/api/alerts';
const WS_URL = '/ws-bitflow';

@Injectable({
    providedIn: 'root'
})
export class AlertsService {
    private stompClient: Client;
    private alertSubject = new Subject<any>();
    public alertTriggered$ = this.alertSubject.asObservable();

    constructor(private http: HttpClient, private authService: AuthService) {
        this.stompClient = new Client({
            webSocketFactory: () => new (SockJS as any)(WS_URL),
            reconnectDelay: 5000,
            debug: (str) => console.log(str)
        });

        this.connect();
    }

    private connect() {
        this.stompClient.onConnect = (frame) => {
            this.stompClient.subscribe('/topic/alerts', (message: Message) => {
                if (message.body) {
                    const alert = JSON.parse(message.body);
                    const currentUser = this.authService.currentUserValue;

                    if (currentUser && alert.userId === currentUser.id) {
                        this.alertSubject.next(alert);
                    }
                }
            });
        };

        this.stompClient.activate();
    }

    getAlerts(): Observable<any[]> {
        return this.http.get<any[]>(API_URL);
    }

    createAlert(symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW'): Observable<any> {
        return this.http.post<any>(API_URL, { symbol, targetPrice, condition });
    }
}
