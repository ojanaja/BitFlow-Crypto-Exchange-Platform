package com.bitflow.backend.service;

import com.bitflow.backend.dto.OrderBookResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class OrderBookService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MarketDataService marketDataService;

    private final Random random = new Random();

    @Scheduled(fixedRate = 2000)
    public void broadcastOrderBook() {
        Double btcPrice = marketDataService.getLatestPrices().get("bitcoin");
        if (btcPrice == null)
            return;

        OrderBookResponse orderBook = generateMockOrderBook("BTC/USD", btcPrice);
        messagingTemplate.convertAndSend("/topic/orderbook", orderBook);
    }

    private OrderBookResponse generateMockOrderBook(String symbol, Double midPrice) {
        List<OrderBookResponse.Entry> bids = new ArrayList<>();
        List<OrderBookResponse.Entry> asks = new ArrayList<>();

        double spread = midPrice * 0.0005;
        double bidStart = midPrice - (spread / 2);
        double askStart = midPrice + (spread / 2);

        double bidTotal = 0;
        for (int i = 0; i < 15; i++) {
            double price = bidStart - (i * midPrice * 0.0002);
            double qty = 0.1 + random.nextDouble() * 2.5;
            bidTotal += qty;
            bids.add(new OrderBookResponse.Entry(
                    Math.round(price * 100.0) / 100.0,
                    Math.round(qty * 10000.0) / 10000.0,
                    Math.round(bidTotal * 10000.0) / 10000.0));
        }

        double askTotal = 0;
        for (int i = 0; i < 15; i++) {
            double price = askStart + (i * midPrice * 0.0002);
            double qty = 0.1 + random.nextDouble() * 2.5;
            askTotal += qty;
            asks.add(new OrderBookResponse.Entry(
                    Math.round(price * 100.0) / 100.0,
                    Math.round(qty * 10000.0) / 10000.0,
                    Math.round(askTotal * 10000.0) / 10000.0));
        }

        return new OrderBookResponse(symbol, bids, asks);
    }
}
