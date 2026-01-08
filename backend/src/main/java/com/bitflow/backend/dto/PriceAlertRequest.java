package com.bitflow.backend.dto;

import com.bitflow.backend.model.AlertCondition;
import lombok.Data;

@Data
public class PriceAlertRequest {
    private String symbol;
    private Double targetPrice;
    private AlertCondition condition;
}
