package com.bitflow.backend.controller;

import com.bitflow.backend.model.Wallet;
import com.bitflow.backend.security.services.UserDetailsImpl;
import com.bitflow.backend.service.TradingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private TradingService tradingService;

    @Autowired
    private com.bitflow.backend.service.SolanaService solanaService;

    @GetMapping
    public ResponseEntity<Wallet> getWallet(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Wallet wallet = tradingService.getWallet(userDetails.getId());
        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/deposit")
    public ResponseEntity<Wallet> deposit(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody com.bitflow.backend.dto.DepositRequest request) {
        Wallet wallet = tradingService.depositFunds(userDetails.getId(), request.getAmount());
        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Wallet> withdraw(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody com.bitflow.backend.dto.WithdrawRequest request) {
        Wallet wallet = tradingService.withdrawFunds(userDetails.getId(), request.getAmount());
        return ResponseEntity.ok(wallet);
    }

    @GetMapping("/solana/balance")
    public ResponseEntity<Double> getSolanaBalance(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        double balance = solanaService.getBalance(userDetails.getUsername());
        return ResponseEntity.ok(balance);
    }
}
