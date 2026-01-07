package com.bitflow.backend.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MockMarketDataService implements MarketDataService {

    private final Map<String, Double> prices = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public MockMarketDataService() {
        // Initialize with some base prices
        prices.put("bitcoin", 45000.00);
        prices.put("ethereum", 2500.00);
        prices.put("solana", 100.00);
        prices.put("ripple", 0.55);
        prices.put("cardano", 0.50);
        prices.put("dogecoin", 0.08);
        prices.put("polkadot", 7.00);
        prices.put("chainlink", 15.00);
    }

    @Override
    public Map<String, Double> getLatestPrices() {
        // Simulate price changes
        prices.replaceAll((k, v) -> {
            // Change by -0.5% to +0.5%
            double change = (random.nextDouble() - 0.5) / 100; // -0.005 to 0.005
            double newPrice = v * (1 + change);
            return Math.round(newPrice * 100.0) / 100.0; // Round to 2 decimal places
        });
        return new HashMap<>(prices);
    }
}
