package com.bitflow.backend.dto;

import com.bitflow.backend.model.OrderCategory;
import com.bitflow.backend.model.OrderType;
import lombok.Data;

@Data
public class OrderRequest {
    private String symbol;
    private OrderType type;
    private OrderCategory category;
    private Double quantity;
    private Double targetPrice;
}
