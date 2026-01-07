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
        prices.replaceAll((k, v) -> {
            double change = (random.nextDouble() - 0.5) / 100;
            double newPrice = v * (1 + change);
            return Math.round(newPrice * 100.0) / 100.0;
        });
        return new HashMap<>(prices);
    }
}
