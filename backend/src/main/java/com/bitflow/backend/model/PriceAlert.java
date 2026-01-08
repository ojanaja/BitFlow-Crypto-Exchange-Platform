package com.bitflow.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "price_alerts")
@Data
@NoArgsConstructor
public class PriceAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String symbol;
    private Double targetPrice;

    @Enumerated(EnumType.STRING)
    private AlertCondition condition;

    @Enumerated(EnumType.STRING)
    private AlertStatus status;

    private LocalDateTime createdAt;

    public PriceAlert(User user, String symbol, Double targetPrice, AlertCondition condition) {
        this.user = user;
        this.symbol = symbol;
        this.targetPrice = targetPrice;
        this.condition = condition;
        this.status = AlertStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }
}
