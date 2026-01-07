package com.bitflow.backend.service;

import java.util.Map;

public interface MarketDataService {
    Map<String, Double> getLatestPrices();
}
