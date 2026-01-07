package com.bitflow.backend.controller;

import com.bitflow.backend.dto.OrderRequest;
import com.bitflow.backend.model.Order;
import com.bitflow.backend.repository.OrderRepository;
import com.bitflow.backend.security.services.UserDetailsImpl;
import com.bitflow.backend.service.TradingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private TradingService tradingService;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping
    public ResponseEntity<?> placeOrder(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody OrderRequest orderRequest) {
        try {
            Order order = tradingService.executeOrder(
                    userDetails.getId(),
                    orderRequest.getSymbol(),
                    orderRequest.getType(),
                    orderRequest.getQuantity());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrderHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Order> orders = orderRepository.findByUserId(userDetails.getId());
        return ResponseEntity.ok(orders);
    }
}
