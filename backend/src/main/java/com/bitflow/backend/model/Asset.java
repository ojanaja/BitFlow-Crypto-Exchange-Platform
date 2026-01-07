package com.bitflow.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "assets")
@Data
@NoArgsConstructor
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String symbol; // e.g., "BTC", "USD"

    private Double quantity;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ToString.Exclude
    private Wallet wallet;

    public Asset(String symbol, Double quantity, Wallet wallet) {
        this.symbol = symbol;
        this.quantity = quantity;
        this.wallet = wallet;
    }
}
