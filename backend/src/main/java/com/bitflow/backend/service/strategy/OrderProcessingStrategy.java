package com.bitflow.backend.service.strategy;

import com.bitflow.backend.dto.OrderRequest;
import com.bitflow.backend.model.Order;
import com.bitflow.backend.model.OrderCategory;
import com.bitflow.backend.model.User;
import com.bitflow.backend.model.Wallet;

public interface OrderProcessingStrategy {
    Order processOrder(OrderRequest request, User user, Wallet wallet);

    OrderCategory getCategory();
}
