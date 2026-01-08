package com.bitflow.backend.service;

import com.bitflow.backend.dto.OrderRequest;
import com.bitflow.backend.exception.BusinessException;
import com.bitflow.backend.model.*;
import com.bitflow.backend.repository.OrderRepository;
import com.bitflow.backend.repository.UserRepository;
import com.bitflow.backend.repository.WalletRepository;
import com.bitflow.backend.service.strategy.OrderProcessingStrategy;
import com.bitflow.backend.service.strategy.OrderStrategyFactory;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TradingService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderStrategyFactory orderStrategyFactory;

    @Transactional
    public Wallet depositFunds(Long userId, Double amount) {
        if (amount <= 0) {
            throw new BusinessException("Deposit amount must be positive");
        }

        Wallet wallet = getWallet(userId);
        Asset usd = getOrCreateAsset(wallet, "USD");
        usd.setQuantity(usd.getQuantity() + amount);

        return walletRepository.save(wallet);
    }

    @Transactional
    public Wallet withdrawFunds(Long userId, Double amount) {
        if (amount <= 0) {
            throw new BusinessException("Withdrawal amount must be positive");
        }

        Wallet wallet = getWallet(userId);
        Asset usd = getOrCreateAsset(wallet, "USD");

        if (usd.getQuantity() < amount) {
            throw new BusinessException("Insufficient funds");
        }

        usd.setQuantity(usd.getQuantity() - amount);
        return walletRepository.save(wallet);
    }

    @Transactional
    public Order placeOrder(Long userId, String symbol, OrderType type, OrderCategory category, Double quantity,
            Double targetPrice) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createInitialWallet(user));

        OrderProcessingStrategy strategy = orderStrategyFactory.getStrategy(category);
        if (strategy == null) {
            throw new BusinessException("Unsupported order category: " + category);
        }

        OrderRequest request = new OrderRequest();
        request.setSymbol(symbol);
        request.setType(type);
        request.setCategory(category);
        request.setQuantity(quantity);
        request.setTargetPrice(targetPrice);

        Order order = strategy.processOrder(request, user, wallet);
        return orderRepository.save(order);
    }

    @Transactional
    public void settleLimitOrder(Order order, Double executionPrice) {
        if (order.getStatus() != OrderStatus.PENDING) {
            return;
        }

        Wallet wallet = walletRepository.findByUserId(order.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (order.getType() == OrderType.BUY) {
            Asset crypto = getOrCreateAsset(wallet, order.getSymbol().toUpperCase());
            crypto.setQuantity(crypto.getQuantity() + order.getQuantity());

            Double lockedAmount = order.getTargetPrice() * order.getQuantity();
            Double actualCost = executionPrice * order.getQuantity();

            if (actualCost < lockedAmount) {
                Asset usd = getOrCreateAsset(wallet, "USD");
                usd.setQuantity(usd.getQuantity() + (lockedAmount - actualCost));
            }

        } else {
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
