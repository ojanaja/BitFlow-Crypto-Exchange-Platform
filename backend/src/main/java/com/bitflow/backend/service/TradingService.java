package com.bitflow.backend.service;

import com.bitflow.backend.model.*;
import com.bitflow.backend.repository.OrderRepository;
import com.bitflow.backend.repository.UserRepository;
import com.bitflow.backend.repository.WalletRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TradingService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MarketDataService marketDataService;

    @Transactional
    public Order executeOrder(Long userId, String symbol, OrderType type, Double quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createInitialWallet(user));

        Double currentPrice = marketDataService.getLatestPrices().get(symbol.toLowerCase());
        if (currentPrice == null) {
            throw new RuntimeException("Price not available for: " + symbol);
        }

        Double totalCost = currentPrice * quantity;

        if (type == OrderType.BUY) {
            handleBuy(wallet, symbol, quantity, totalCost);
        } else {
            handleSell(wallet, symbol, quantity, totalCost);
        }

        Order order = new Order(user, symbol, type, quantity, currentPrice, LocalDateTime.now(), OrderStatus.FILLED);
        return orderRepository.save(order);
    }

    private void handleBuy(Wallet wallet, String symbol, Double quantity, Double totalCost) {
        Asset usd = getOrCreateAsset(wallet, "USD");
        if (usd.getQuantity() < totalCost) {
            throw new RuntimeException("Insufficient USD balance");
        }
        usd.setQuantity(usd.getQuantity() - totalCost);

        Asset crypto = getOrCreateAsset(wallet, symbol.toUpperCase());
        crypto.setQuantity(crypto.getQuantity() + quantity);

        walletRepository.save(wallet);
    }

    private void handleSell(Wallet wallet, String symbol, Double quantity, Double totalValue) {
        Asset crypto = getOrCreateAsset(wallet, symbol.toUpperCase());
        if (crypto.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient " + symbol + " balance");
        }
        crypto.setQuantity(crypto.getQuantity() - quantity);

        Asset usd = getOrCreateAsset(wallet, "USD");
        usd.setQuantity(usd.getQuantity() + totalValue);

        walletRepository.save(wallet);
    }

    private Asset getOrCreateAsset(Wallet wallet, String symbol) {
        return wallet.getAssets().stream()
                .filter(a -> a.getSymbol().equalsIgnoreCase(symbol))
                .findFirst()
                .orElseGet(() -> {
                    Asset newAsset = new Asset(symbol.toUpperCase(), 0.0, wallet);
                    wallet.getAssets().add(newAsset);
                    return newAsset;
                });
    }

    private Wallet createInitialWallet(User user) {
        Wallet wallet = new Wallet(user);
        wallet.getAssets().add(new Asset("USD", 50000.0, wallet));
        return walletRepository.save(wallet);
    }

    public Wallet getWallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    return createInitialWallet(user);
                });
    }
}
