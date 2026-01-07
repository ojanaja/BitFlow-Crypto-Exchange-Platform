package com.bitflow.backend.controller;

import com.bitflow.backend.model.Wallet;
import com.bitflow.backend.security.services.UserDetailsImpl;
import com.bitflow.backend.service.TradingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private TradingService tradingService;

    @GetMapping
    public ResponseEntity<Wallet> getWallet(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Wallet wallet = tradingService.getWallet(userDetails.getId());
        return ResponseEntity.ok(wallet);
    }
}
