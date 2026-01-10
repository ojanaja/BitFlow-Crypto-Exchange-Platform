package com.bitflow.backend.controller;

import com.bitflow.backend.service.CoinCapMarketDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "*")
@Tag(name = "Market", description = "Market data APIs")
public class MarketController {

    private final CoinCapMarketDataService marketDataService;

    @Autowired
    public MarketController(CoinCapMarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping("/history/{assetId}")
    @Operation(summary = "Get Market History", description = "Get historical market data for an asset")
    public ResponseEntity<List<Map<String, Object>>> getMarketHistory(
            @PathVariable String assetId,
            @RequestParam(defaultValue = "1") int days) {

        List<Map<String, Object>> data = marketDataService.getMarketChart(assetId, days);
        return ResponseEntity.ok(data);
    }
}
