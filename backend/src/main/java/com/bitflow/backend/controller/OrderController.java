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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order management APIs")
public class OrderController {

    @Autowired
    private TradingService tradingService;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping
    @Operation(summary = "Place Order", description = "Place a new buy or sell order")
    public ResponseEntity<?> placeOrder(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @jakarta.validation.Valid @RequestBody OrderRequest orderRequest) {
        try {
            com.bitflow.backend.model.OrderCategory category = orderRequest.getCategory() != null
                    ? orderRequest.getCategory()
                    : com.bitflow.backend.model.OrderCategory.MARKET;

            Order order = tradingService.placeOrder(
                    userDetails.getId(),
                    orderRequest.getSymbol(),
                    orderRequest.getType(),
                    category,
                    orderRequest.getQuantity(),
                    orderRequest.getTargetPrice());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Get Order History", description = "Get order history for the authenticated user")
    public ResponseEntity<List<Order>> getOrderHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Order> orders = orderRepository.findByUserId(userDetails.getId());
        return ResponseEntity.ok(orders);
    }
}
