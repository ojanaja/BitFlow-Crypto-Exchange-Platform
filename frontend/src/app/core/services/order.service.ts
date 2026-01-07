import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = '/api/orders';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    constructor(private http: HttpClient) { }

    placeOrder(order: any): Observable<any> {
        return this.http.post(API_URL, order);
    }

    getOrders(): Observable<any[]> {
        return this.http.get<any[]>(API_URL);
    }
}
