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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
@Tag(name = "Wallet", description = "Wallet management APIs")
public class WalletController {

    @Autowired
    private TradingService tradingService;

    @Autowired
    private com.bitflow.backend.service.SolanaService solanaService;

    @GetMapping
    @Operation(summary = "Get Wallet", description = "Get details of the authenticated user's wallet")
    public ResponseEntity<Wallet> getWallet(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Wallet wallet = tradingService.getWallet(userDetails.getId());
        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/deposit")
    @Operation(summary = "Deposit Funds", description = "Deposit funds into the wallet")
    public ResponseEntity<Wallet> deposit(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody com.bitflow.backend.dto.DepositRequest request) {
        Wallet wallet = tradingService.depositFunds(userDetails.getId(), request.getAmount());
        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw Funds", description = "Withdraw funds from the wallet")
    public ResponseEntity<Wallet> withdraw(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody com.bitflow.backend.dto.WithdrawRequest request) {
        Wallet wallet = tradingService.withdrawFunds(userDetails.getId(), request.getAmount());
        return ResponseEntity.ok(wallet);
    }

    @GetMapping("/solana/balance")
    @Operation(summary = "Get Solana Balance", description = "Get current Solana balance for the user")
    public ResponseEntity<Double> getSolanaBalance(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        double balance = solanaService.getBalance(userDetails.getUsername());
        return ResponseEntity.ok(balance);
    }
}
