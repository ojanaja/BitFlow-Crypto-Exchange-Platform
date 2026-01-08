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
import com.bitflow.backend.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class MarketOrderStrategy implements OrderProcessingStrategy {

    private final WalletRepository walletRepository;
    private final MarketDataService marketDataService;

    @Override
    public OrderCategory getCategory() {
        return OrderCategory.MARKET;
    }

    @Override
    public Order processOrder(OrderRequest request, User user, Wallet wallet) {
        String symbol = request.getSymbol();
        Double quantity = request.getQuantity();

        Double currentPrice = marketDataService.getLatestPrices().get(symbol.toLowerCase());
        if (currentPrice == null) {
            throw new BusinessException("Price not available for: " + symbol);
        }

        Double totalValue = currentPrice * quantity;

        if (request.getType() == OrderType.BUY) {
            handleBuy(wallet, symbol, quantity, totalValue);
        } else {
            handleSell(wallet, symbol, quantity, totalValue);
        }

        return new Order(user, symbol, request.getType(), OrderCategory.MARKET, quantity, currentPrice, null,
                LocalDateTime.now(), OrderStatus.FILLED);
    }

    private void handleBuy(Wallet wallet, String symbol, Double quantity, Double totalCost) {
        Asset usd = getOrCreateAsset(wallet, "USD");
        if (usd.getQuantity() < totalCost) {
            throw new BusinessException("Insufficient USD balance");
        }
        usd.setQuantity(usd.getQuantity() - totalCost);

        Asset crypto = getOrCreateAsset(wallet, symbol.toUpperCase());
        crypto.setQuantity(crypto.getQuantity() + quantity);

        walletRepository.save(wallet);
    }

    private void handleSell(Wallet wallet, String symbol, Double quantity, Double totalValue) {
        Asset crypto = getOrCreateAsset(wallet, symbol.toUpperCase());
        if (crypto.getQuantity() < quantity) {
            throw new BusinessException("Insufficient " + symbol + " balance");
        }
        crypto.setQuantity(crypto.getQuantity() - quantity);

        Asset usd = getOrCreateAsset(wallet, "USD");
        usd.setQuantity(usd.getQuantity() + totalValue);

        walletRepository.save(wallet);
    }

    // Helper method to handle asset retrieval/creation (could be moved to a shared
    // utility or service)
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
