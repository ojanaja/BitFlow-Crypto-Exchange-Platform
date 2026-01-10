package com.bitflow.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Primary
public class BinanceMarketDataService implements MarketDataService {

    private final Map<String, Double> prices = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, String> symbolMapping = new HashMap<>();

    @Autowired
    public BinanceMarketDataService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        initializeMapping();
    }

    private void initializeMapping() {
        symbolMapping.put("btcusdt", "bitcoin");
        symbolMapping.put("ethusdt", "ethereum");
        symbolMapping.put("solusdt", "solana");
        symbolMapping.put("xrpusdt", "ripple");
        symbolMapping.put("adausdt", "cardano");
        symbolMapping.put("dogeusdt", "dogecoin");
        symbolMapping.put("dotusdt", "polkadot");
        symbolMapping.put("linkusdt", "chainlink");
    }

    @PostConstruct
    public void connect() {
        StandardWebSocketClient client = new StandardWebSocketClient();
        String uri = "wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker/solusdt@miniTicker/xrpusdt@miniTicker/adausdt@miniTicker/dogeusdt@miniTicker/dotusdt@miniTicker/linkusdt@miniTicker";

        try {
            client.doHandshake(new BinanceWebSocketHandler(), new org.springframework.web.socket.WebSocketHttpHeaders(),
                    java.net.URI.create(uri));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public Map<String, Double> getLatestPrices() {
        return new HashMap<>(prices);
    }

    private class BinanceWebSocketHandler extends TextWebSocketHandler {
        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) {
            try {
                JsonNode node = objectMapper.readTree(message.getPayload());
                JsonNode data = node.get("data");
                if (data == null)
                    return;

                String symbol = data.get("s").asText().toLowerCase();
                String name = symbolMapping.get(symbol);

                if (name != null) {
                    double price = data.get("c").asDouble();
                    prices.put(name, price);

                    messagingTemplate.convertAndSend("/topic/prices", prices);
                }
            } catch (Exception e) {
            }
        }
    }
}
