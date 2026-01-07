package com.bitflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class OrderBookResponse {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Entry {
        private Double price;
        private Double quantity;
        private Double total;
    }

    private String symbol;
    private List<Entry> bids;
    private List<Entry> asks;

    public OrderBookResponse(String symbol, List<Entry> bids, List<Entry> asks) {
        this.symbol = symbol;
        this.bids = bids;
        this.asks = asks;
    }

    public String getSymbol() {
        return symbol;
    }

    public List<Entry> getBids() {
        return bids;
    }

    public List<Entry> getAsks() {
        return asks;
    }
}
