package com.bitflow.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import org.springframework.web.reactive.socket.client.ReactorNettyWebSocketClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;

import java.net.URI;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Primary
public class MexcMarketDataService implements MarketDataService {

    private static final Logger logger = LoggerFactory.getLogger(MexcMarketDataService.class);
    private static final String WS_ENDPOINT = "wss://wbs.mexc.com/ws";

    private final Map<String, Double> prices = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, String> symbolMapping = new HashMap<>();

    @Autowired
    public MexcMarketDataService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        initializeMapping();
    }

    private void initializeMapping() {
        symbolMapping.put("BTCUSDT", "bitcoin");
        symbolMapping.put("ETHUSDT", "ethereum");
        symbolMapping.put("SOLUSDT", "solana");
        symbolMapping.put("XRPUSDT", "ripple");
        symbolMapping.put("ADAUSDT", "cardano");
        symbolMapping.put("DOGEUSDT", "dogecoin");
        symbolMapping.put("DOTUSDT", "polkadot");
        symbolMapping.put("LINKUSDT", "chainlink");
    }

    @PostConstruct
    public void connect() {
        try {
            HttpClient httpClient = HttpClient.create().secure(ssl -> {
                try {
                    ssl.sslContext(SslContextBuilder.forClient()
                            .trustManager(InsecureTrustManagerFactory.INSTANCE)
                            .build());
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            });

            ReactorNettyWebSocketClient client = new ReactorNettyWebSocketClient(httpClient);

            client.execute(URI.create(WS_ENDPOINT), new MexcReactiveWebSocketHandler())
                    .subscribe(
                            null,
                            error -> logger.error("MEXC WebSocket Error", error),
                            () -> logger.info("MEXC WebSocket Closed"));

            logger.info("Connecting to MEXC WebSocket (Reactive): " + WS_ENDPOINT);

        } catch (Exception e) {
            logger.error("Failed to initiate MEXC WebSocket connection", e);
        }
    }

    @Override
    public Map<String, Double> getLatestPrices() {
        return new HashMap<>(prices);
    }

    private class MexcReactiveWebSocketHandler implements WebSocketHandler {
        @Override
        public Mono<Void> handle(WebSocketSession session) {
            logger.info("Connected to MEXC WebSocket Session: " + session.getId());

            String subscriptionMsg = createSubscriptionMessage();
            Mono<Void> sendSubscription = session.send(
                    Mono.just(session.textMessage(subscriptionMsg))).then();

            Flux<WebSocketMessage> pingFlux = Flux.interval(Duration.ofSeconds(20))
                    .map(i -> session.textMessage("{\"method\":\"PING\"}"));

            Mono<Void> sendPings = session.send(pingFlux);

            Mono<Void> receive = session.receive()
                    .map(WebSocketMessage::getPayloadAsText)
                    .doOnNext(this::processMessage)
                    .then();

            return Mono.firstWithSignal(
                    sendSubscription.then(sendPings),
                    receive).then();
        }

        private String createSubscriptionMessage() {
            StringBuilder params = new StringBuilder();
            int i = 0;
            for (String mexcSymbol : symbolMapping.keySet()) {
                if (i > 0)
                    params.append(",");
                params.append("\"spot@public.miniTicker.v3.api@").append(mexcSymbol).append("\"");
                i++;
            }
            return String.format("{\"method\":\"SUBSCRIPTION\",\"params\":[%s]}", params.toString());
        }

        private void processMessage(String payload) {
            try {
                if (payload.contains("PONG") || payload.contains("SUBSCRIPTION")) {
                    return;
                }

                JsonNode node = objectMapper.readTree(payload);

                if (node.has("d") && node.has("c")) {
                    String channel = node.get("c").asText();
                    JsonNode data = node.get("d");

                    String[] parts = channel.split("@");
                    if (parts.length > 0) {
                        String symbol = parts[parts.length - 1];
                        String name = symbolMapping.get(symbol);

                        if (name != null && data.has("p")) {
                            double price = data.get("p").asDouble();
                            prices.put(name, price);

                            messagingTemplate.convertAndSend("/topic/prices", prices);
                        }
                    }
                }
            } catch (Exception e) {
            }
        }
    }
}
