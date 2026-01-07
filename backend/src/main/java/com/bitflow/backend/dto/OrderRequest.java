package com.bitflow.backend.dto;

import com.bitflow.backend.model.OrderType;
import lombok.Data;

@Data
public class OrderRequest {
    private String symbol;
    private OrderType type;
    private Double quantity;
}
