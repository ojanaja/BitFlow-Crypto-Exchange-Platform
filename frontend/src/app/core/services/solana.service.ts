import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import * as bs58 from 'bs58';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

declare const window: any;

@Injectable({
    providedIn: 'root'
})
export class SolanaService {
    private walletAddressSubject: BehaviorSubject<string | null>;
    public walletAddress$: Observable<string | null>;
    private connection: Connection;

    constructor(private http: HttpClient) {
        this.walletAddressSubject = new BehaviorSubject<string | null>(localStorage.getItem('walletAddress'));
        this.walletAddress$ = this.walletAddressSubject.asObservable();
        this.connection = new Connection('https://api.devnet.solana.com'); 
    }

    get isPhantomInstalled(): boolean {
        return window?.solana?.isPhantom;
    }

    async connect(): Promise<string> {
        if (!this.isPhantomInstalled) {
            window.open('https://phantom.app/', '_blank');
            throw new Error('Phantom wallet not installed');
        }

        try {
            const resp = await window.solana.connect();
            const publicKey = resp.publicKey.toString();
            this.walletAddressSubject.next(publicKey);
            localStorage.setItem('walletAddress', publicKey);
            return publicKey;
        } catch (err: any) {
            throw new Error(err.message || 'User rejected connection');
        }
    }

    async signMessage(message: string): Promise<string> {
        if (!this.walletAddressSubject.value) {
            await this.connect();
        }

        try {
            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
            return bs58.default.encode(signedMessage.signature);
        } catch (err: any) {
            throw new Error(err.message || 'Signing failed');
        }
    }

    async getBalance(walletAddress: string): Promise<number> {
        try {
            const balance = await firstValueFrom(this.http.get<number>('/api/wallet/solana/balance'));
            return balance;
        } catch (error) {
            console.error('Error fetching balance via proxy:', error);
            return 0;
        }
    }

    disconnect() {
        if (window.solana) {
            window.solana.disconnect();
        }
        this.walletAddressSubject.next(null);
        localStorage.removeItem('walletAddress');
    }
}
