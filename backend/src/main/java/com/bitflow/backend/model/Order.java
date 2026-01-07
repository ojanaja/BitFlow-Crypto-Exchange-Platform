package com.bitflow.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String symbol;

    @Enumerated(EnumType.STRING)
    private OrderType type;

    private Double quantity;

    private Double price;

    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    public Order(User user, String symbol, OrderType type, Double quantity, Double price, LocalDateTime timestamp,
            OrderStatus status) {
        this.user = user;
        this.symbol = symbol;
        this.type = type;
        this.quantity = quantity;
        this.price = price;
        this.timestamp = timestamp;
        this.status = status;
    }
}
