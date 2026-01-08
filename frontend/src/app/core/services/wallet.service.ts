import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = '/api/wallet';

@Injectable({
    providedIn: 'root'
})
export class WalletService {
    constructor(private http: HttpClient) { }

    getWallet(): Observable<any> {
        return this.http.get<any>(API_URL);
    }

    deposit(amount: number): Observable<any> {
        return this.http.post<any>(`${API_URL}/deposit`, { amount });
    }

    withdraw(amount: number): Observable<any> {
        return this.http.post<any>(`${API_URL}/withdraw`, { amount });
    }
}
