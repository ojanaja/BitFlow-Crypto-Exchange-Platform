package com.bitflow.backend.service;

import com.bitflow.backend.model.Order;
import com.bitflow.backend.model.OrderCategory;
import com.bitflow.backend.model.OrderStatus;
import com.bitflow.backend.model.OrderType;
import com.bitflow.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class MatchingEngineService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MarketDataService marketDataService;

    @Autowired
    private TradingService tradingService;

    @Scheduled(fixedRate = 3000)
    public void matchOrders() {
        List<Order> pendingOrders = orderRepository.findByStatus(OrderStatus.PENDING);
        if (pendingOrders.isEmpty()) {
            return;
        }

        Map<String, Double> prices = marketDataService.getLatestPrices();

        for (Order order : pendingOrders) {
            Double currentPrice = prices.get(order.getSymbol().toLowerCase());
            if (currentPrice == null)
                continue;

            boolean shouldExecute = false;

            if (order.getType() == OrderType.BUY) {
                if (currentPrice <= order.getTargetPrice()) {
                    shouldExecute = true;
                }
            } else {
                if (currentPrice >= order.getTargetPrice()) {
                    shouldExecute = true;
                }
            }

            if (shouldExecute) {
                try {
                    tradingService.settleLimitOrder(order, currentPrice);
                    System.out.println("Executed LIMIT Order #" + order.getId() + " at " + currentPrice);
                } catch (Exception e) {
                    System.err.println("Failed to execute order #" + order.getId() + ": " + e.getMessage());
                }
            }
        }
    }
}
