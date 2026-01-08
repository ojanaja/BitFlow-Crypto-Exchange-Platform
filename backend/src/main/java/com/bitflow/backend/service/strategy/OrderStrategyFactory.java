package com.bitflow.backend.service.strategy;

import com.bitflow.backend.model.OrderCategory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class OrderStrategyFactory {

    private final Map<OrderCategory, OrderProcessingStrategy> strategies;

    public OrderStrategyFactory(List<OrderProcessingStrategy> strategyList) {
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(OrderProcessingStrategy::getCategory, Function.identity()));
    }

    public OrderProcessingStrategy getStrategy(OrderCategory category) {
        return strategies.get(category);
    }
}
