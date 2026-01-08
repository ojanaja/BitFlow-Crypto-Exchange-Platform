import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as bs58 from 'bs58';

declare const window: any;

@Injectable({
    providedIn: 'root'
})
export class SolanaService {
    private walletAddressSubject: BehaviorSubject<string | null>;
    public walletAddress$: Observable<string | null>;

    constructor() {
        this.walletAddressSubject = new BehaviorSubject<string | null>(null);
        this.walletAddress$ = this.walletAddressSubject.asObservable();
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

            // Phantom returns { signature: Uint8Array, publicKey: ... }
            // We need to encode signature to Base58
            return bs58.default.encode(signedMessage.signature);
        } catch (err: any) {
            throw new Error(err.message || 'Signing failed');
        }
    }

    disconnect() {
        if (window.solana) {
            window.solana.disconnect();
        }
        this.walletAddressSubject.next(null);
    }
}
