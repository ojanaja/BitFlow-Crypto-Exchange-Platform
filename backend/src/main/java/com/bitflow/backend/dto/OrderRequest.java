package com.bitflow.backend.dto;

import com.bitflow.backend.model.OrderCategory;
import com.bitflow.backend.model.OrderType;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Data
public class OrderRequest {
    @NotBlank(message = "Symbol is required")
    private String symbol;

    @NotNull(message = "Order type is required")
    private OrderType type;

    private OrderCategory category;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @Positive(message = "Target price must be positive")
    private Double targetPrice;
}
