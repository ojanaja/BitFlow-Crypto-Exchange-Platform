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
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;

import java.net.URI;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Primary
public class CoinCapMarketDataService implements MarketDataService {

    private static final Logger logger = LoggerFactory.getLogger(CoinCapMarketDataService.class);
    private static final String WS_ENDPOINT = "wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana,xrp,cardano,dogecoin,polkadot,chainlink,litecoin";

    private final Map<String, Double> prices = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public CoinCapMarketDataService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
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

            client.execute(URI.create(WS_ENDPOINT), new CoinCapReactiveWebSocketHandler())
                    .subscribe(
                            null,
                            error -> logger.error("CoinCap WebSocket Error", error),
                            () -> logger.info("CoinCap WebSocket Closed"));

            logger.info("Connecting to CoinCap WebSocket: " + WS_ENDPOINT);

        } catch (Exception e) {
            logger.error("Failed to initiate CoinCap WebSocket connection", e);
        }
    }

    private Map<String, Object> cachedTrends = new HashMap<>();
    private java.util.List<Map<String, Object>> cachedAllMarkets = new java.util.ArrayList<>();

    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    public void fetchMarketTrends() {
        logger.info("Fetching Market Trends via RestTemplate...");
        try {
            javax.net.ssl.TrustManager[] trustAllCerts = new javax.net.ssl.TrustManager[] {
                    new javax.net.ssl.X509TrustManager() {
                        public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                            return null;
                        }

                        public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {
                        }

                        public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {
                        }
                    }
            };

            javax.net.ssl.SSLContext sc = javax.net.ssl.SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            javax.net.ssl.HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            javax.net.ssl.HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);

            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

            try {
                String response = restTemplate.getForObject(
                        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false",
                        String.class);

                if (response != null) {
                    JsonNode root = objectMapper.readTree(response);
                    JsonNode data = root;

                    java.util.List<Map<String, Object>> assets = new java.util.ArrayList<>();
                    if (data.isArray()) {
                        for (JsonNode node : data) {
                            Map<String, Object> asset = new HashMap<>();
                            asset.put("id", node.get("id").asText());
                            asset.put("name", node.get("name").asText());
                            asset.put("symbol", node.get("symbol").asText());
                            asset.put("price", node.get("current_price").asDouble());
                            asset.put("change", node.get("price_change_percentage_24h").asDouble());
                            asset.put("volume", node.get("total_volume").asDouble());

                            asset.put("imageKey", node.get("symbol").asText().toLowerCase());

                            assets.add(asset);
                        }
                    }

                    this.cachedAllMarkets = new java.util.ArrayList<>(assets);

                    Map<String, Object> trends = new HashMap<>();

                    assets.sort((a, b) -> Double.compare((double) b.get("change"), (double) a.get("change")));
                    trends.put("gainers", new java.util.ArrayList<>(assets.subList(0, Math.min(5, assets.size()))));

                    assets.sort((a, b) -> Double.compare((double) a.get("change"), (double) b.get("change")));
                    trends.put("losers", new java.util.ArrayList<>(assets.subList(0, Math.min(5, assets.size()))));

                    assets.sort((a, b) -> Double.compare((double) b.get("volume"), (double) a.get("volume")));
                    trends.put("volume", new java.util.ArrayList<>(assets.subList(0, Math.min(5, assets.size()))));

                    this.cachedTrends = trends;
                    logger.info("Updated cached market trends for {} assets. Gainers: {}, Losers: {}, Volume: {}",
                            assets.size(),
                            ((java.util.List) trends.get("gainers")).size(),
                            ((java.util.List) trends.get("losers")).size(),
                            ((java.util.List) trends.get("volume")).size());
                }
            } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
                logger.warn("CoinGecko Rate Limit Exceeded (429). Skipping this poll.");
            }

        } catch (Exception e) {
            logger.error("Error fetching market trends", e);
        }
    }

    public java.util.List<Map<String, Object>> getMarketChart(String assetId, int days) {
        try {
            javax.net.ssl.TrustManager[] trustAllCerts = new javax.net.ssl.TrustManager[] {
                    new javax.net.ssl.X509TrustManager() {
                        public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                            return null;
                        }

                        public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {
                        }

                        public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {
                        }
                    }
            };

            javax.net.ssl.SSLContext sc = javax.net.ssl.SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            javax.net.ssl.HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            javax.net.ssl.HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);

            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

            String url = String.format(
                    "https://api.coingecko.com/api/v3/coins/%s/ohlc?vs_currency=usd&days=%d",
                    assetId, days);

            String response = restTemplate.getForObject(url, String.class);

            if (response != null) {
                JsonNode root = objectMapper.readTree(response);

                java.util.List<Map<String, Object>> chartData = new java.util.ArrayList<>();

                if (root.isArray()) {
                    for (JsonNode point : root) {
                        if (point.isArray() && point.size() >= 5) {
                            Map<String, Object> dataPoint = new HashMap<>();

                            long timestamp = point.get(0).asLong();
                            double open = point.get(1).asDouble();
                            double high = point.get(2).asDouble();
                            double low = point.get(3).asDouble();
                            double close = point.get(4).asDouble();

                            dataPoint.put("time", timestamp / 1000);
                            dataPoint.put("open", open);
                            dataPoint.put("high", high);
                            dataPoint.put("low", low);
                            dataPoint.put("close", close);
                            dataPoint.put("value", close);

                            chartData.add(dataPoint);
                        }
                    }
                }
                return chartData;
            }
        } catch (Exception e) {
            logger.error("Error fetching market OHLC for " + assetId, e);
        }
        return new java.util.ArrayList<>();
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 3000)
    public void broadcastCachedTrends() {
        if (!cachedTrends.isEmpty()) {
            logger.info("Broadcasting cached trends via scheduled task. Size: {}", cachedTrends.size());
            messagingTemplate.convertAndSend("/topic/market-trends", cachedTrends);
        } else {
            logger.info("Cached trends empty, skipping broadcast.");
        }

        if (!cachedAllMarkets.isEmpty()) {
            messagingTemplate.convertAndSend("/topic/all-markets", cachedAllMarkets);
        }
    }

    @Override
    public Map<String, Double> getLatestPrices() {
        return new HashMap<>(prices);
    }

    private class CoinCapReactiveWebSocketHandler implements WebSocketHandler {
        @Override
        public Mono<Void> handle(WebSocketSession session) {
            logger.info("Connected to CoinCap WebSocket Session: " + session.getId());

            return session.receive()
                    .map(WebSocketMessage::getPayloadAsText)
                    .doOnNext(this::processMessage)
                    .then();
        }

        private void processMessage(String payload) {
            try {
                JsonNode node = objectMapper.readTree(payload);

                if (node.has("error")) {

                    return;
                }

                Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> field = fields.next();
                    String asset = field.getKey();

                    JsonNode valueNode = field.getValue();
                    if (valueNode.isTextual() || valueNode.isNumber()) {
                        try {
                            double price = valueNode.asDouble();
                            prices.put(asset, price);
                        } catch (NumberFormatException e) {
                            logger.warn("Invalid price format for {}: {}", asset, valueNode);
                        }
                    }
                }

                if (!prices.isEmpty()) {
                    messagingTemplate.convertAndSend("/topic/prices", prices);
                }

            } catch (Exception e) {
                logger.error("Error processing message: " + payload, e);
            }
        }
    }
}
