import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SolanaService } from '../../../core/services/solana.service';
import { first } from 'rxjs/operators';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    loading = false;
    submitted = false;
    returnUrl!: string;
    error = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private solanaService: SolanaService
    ) {
        if (this.authService.currentUserValue?.token) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    async connectWallet() {
        try {
            this.loading = true;
            this.error = '';

            const walletAddress = await this.solanaService.connect();

            const message = `Login to BitFlow: ${Date.now()}`;
            const signature = await this.solanaService.signMessage(message);

            this.authService.walletLogin(walletAddress, signature, message)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.router.navigate([this.returnUrl]);
                    },
                    error: (err: any) => {
                        this.error = 'Wallet login failed: ' + (err.error?.message || err.message);
                        this.loading = false;
                    }
                });

        } catch (err: any) {
            this.error = err.message;
            this.loading = false;
        }
    }
}
