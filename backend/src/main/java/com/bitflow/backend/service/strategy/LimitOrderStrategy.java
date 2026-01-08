package com.bitflow.backend.service.strategy;

import com.bitflow.backend.dto.OrderRequest;
import com.bitflow.backend.exception.BusinessException;
import com.bitflow.backend.model.Asset;
import com.bitflow.backend.model.Order;
import com.bitflow.backend.model.OrderCategory;
import com.bitflow.backend.model.OrderStatus;
import com.bitflow.backend.model.OrderType;
import com.bitflow.backend.model.User;
import com.bitflow.backend.model.Wallet;
import com.bitflow.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class LimitOrderStrategy implements OrderProcessingStrategy {

    private final WalletRepository walletRepository;

    @Override
    public OrderCategory getCategory() {
        return OrderCategory.LIMIT;
    }

    @Override
    public Order processOrder(OrderRequest request, User user, Wallet wallet) {
        if (request.getTargetPrice() == null || request.getTargetPrice() <= 0) {
            throw new BusinessException("Target price is required for limit orders");
        }

        String symbol = request.getSymbol();
        Double quantity = request.getQuantity();
        Double targetPrice = request.getTargetPrice();
        Double totalValue = targetPrice * quantity;

        if (request.getType() == OrderType.BUY) {
            lockFundsForBuy(wallet, totalValue);
        } else {
            lockFundsForSell(wallet, symbol, quantity);
        }

        return new Order(user, symbol, request.getType(), OrderCategory.LIMIT, quantity, targetPrice, targetPrice,
                LocalDateTime.now(), OrderStatus.PENDING);
    }

    private void lockFundsForBuy(Wallet wallet, Double totalCost) {
        Asset usd = getOrCreateAsset(wallet, "USD");
        if (usd.getQuantity() < totalCost) {
            throw new BusinessException("Insufficient USD balance");
        }
        usd.setQuantity(usd.getQuantity() - totalCost);
        walletRepository.save(wallet);
    }

    private void lockFundsForSell(Wallet wallet, String symbol, Double quantity) {
        Asset crypto = getOrCreateAsset(wallet, symbol.toUpperCase());
        if (crypto.getQuantity() < quantity) {
            throw new BusinessException("Insufficient " + symbol + " balance");
        }
        crypto.setQuantity(crypto.getQuantity() - quantity);
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
}
