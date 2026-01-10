package com.bitflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Service
public class SolanaService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String RPC_URL = "https://api.devnet.solana.com";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public double getBalance(String address) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("jsonrpc", "2.0");
            payload.put("id", 1);
            payload.put("method", "getBalance");
            payload.put("params", new Object[] { address });

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(RPC_URL, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.has("result")) {
                long lamports = root.get("result").get("value").asLong();
                return lamports / 1_000_000_000.0;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0.0;
    }
}
