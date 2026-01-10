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

    get isWalletInstalled(): boolean {
        return !!window?.solana;
    }

    async connect(): Promise<string> {
        // Poll for wallet presence for up to 1 second (10 x 100ms) to handle injection timing
        let attempts = 0;
        while (!this.isWalletInstalled && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!this.isWalletInstalled) {
            window.open('https://phantom.app/', '_blank');
            throw new Error('Solana wallet not installed');
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
            // Vandal returns { signature: Uint8Array } or similar structure depending on implementation
            // Phantom returns { signature: Uint8Array }
            const result = await window.solana.signMessage(encodedMessage, 'utf8');

            // Handle different possible return shapes if necessary, but standard is Object with signature property
            const signatureData = result.signature || result;

            // Re-hydrate Uint8Array if it came back as a regular object (dictionary)
            const signature = signatureData instanceof Uint8Array
                ? signatureData
                : new Uint8Array(Object.values(signatureData));

            return bs58.default.encode(signature);
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
