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
    public Order placeOrder(Long userId, String symbol, OrderType type, OrderCategory category, Double quantity,
            Double targetPrice) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createInitialWallet(user));

        Double currentPrice = marketDataService.getLatestPrices().get(symbol.toLowerCase());
        if (currentPrice == null) {
            throw new RuntimeException("Price not available for: " + symbol);
        }

        // Determine execution price and status
        Double executionPrice = (category == OrderCategory.LIMIT) ? targetPrice : currentPrice;
        OrderStatus initialStatus = (category == OrderCategory.LIMIT) ? OrderStatus.PENDING : OrderStatus.FILLED;

        // Calculate total cost/value
        Double totalValue = executionPrice * quantity;

        // Lock funds or Execute
        if (type == OrderType.BUY) {
            // Check USD balance
            Asset usd = getOrCreateAsset(wallet, "USD");
            if (usd.getQuantity() < totalValue) {
                throw new RuntimeException("Insufficient USD balance");
            }
            // Deduct USD immediately (Lock funds)
            usd.setQuantity(usd.getQuantity() - totalValue);

            // If MARKET, credit crypto immediately
            if (category == OrderCategory.MARKET) {
                Asset crypto = getOrCreateAsset(wallet, symbol.toUpperCase());
                crypto.setQuantity(crypto.getQuantity() + quantity);
            }
        } else {
            // Sell
            Asset crypto = getOrCreateAsset(wallet, symbol.toUpperCase());
            if (crypto.getQuantity() < quantity) {
                throw new RuntimeException("Insufficient " + symbol + " balance");
            }
            // Deduct Crypto immediately (Lock funds)
            crypto.setQuantity(crypto.getQuantity() - quantity);

            // If MARKET, credit USD immediately
            if (category == OrderCategory.MARKET) {
                Asset usd = getOrCreateAsset(wallet, "USD");
                usd.setQuantity(usd.getQuantity() + totalValue);
            }
        }

        walletRepository.save(wallet);

        Order order = new Order(user, symbol, type, category, quantity, executionPrice, targetPrice,
                LocalDateTime.now(), initialStatus);
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

    @Transactional
    public void settleLimitOrder(Order order, Double executionPrice) {
        if (order.getStatus() != OrderStatus.PENDING) {
            return;
        }

        Wallet wallet = walletRepository.findByUserId(order.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (order.getType() == OrderType.BUY) {
            // Funds (USD) were locked at placement.
            // Credit Crypto.
            Asset crypto = getOrCreateAsset(wallet, order.getSymbol().toUpperCase());
            crypto.setQuantity(crypto.getQuantity() + order.getQuantity());

            // Refund difference if bought cheaper
            Double lockedAmount = order.getTargetPrice() * order.getQuantity();
            Double actualCost = executionPrice * order.getQuantity();

            if (actualCost < lockedAmount) {
                Asset usd = getOrCreateAsset(wallet, "USD");
                usd.setQuantity(usd.getQuantity() + (lockedAmount - actualCost));
            }

        } else {
            // SELL LIMIT
            // Crypto was locked at placement.
            // Credit USD.
            Asset usd = getOrCreateAsset(wallet, "USD");
            Double totalValue = executionPrice * order.getQuantity();
            usd.setQuantity(usd.getQuantity() + totalValue);
        }

        order.setStatus(OrderStatus.FILLED);
        order.setPrice(executionPrice);

        orderRepository.save(order);
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
