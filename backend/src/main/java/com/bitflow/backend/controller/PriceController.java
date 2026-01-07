package com.bitflow.backend.controller;

import com.bitflow.backend.service.MarketDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/prices")
public class PriceController {

    @Autowired
    private MarketDataService marketDataService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<Map<String, Double>> getCurrentPrices() {
        return ResponseEntity.ok(marketDataService.getLatestPrices());
    }

    // Push updates every 5 seconds
    @Scheduled(fixedRate = 5000)
    public void broadcastPrices() {
        Map<String, Double> prices = marketDataService.getLatestPrices();
        messagingTemplate.convertAndSend("/topic/prices", prices);
    }
}
