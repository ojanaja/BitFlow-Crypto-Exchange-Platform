package com.bitflow.backend.service;

import com.bitflow.backend.dto.PriceAlertRequest;
import com.bitflow.backend.model.AlertCondition;
import com.bitflow.backend.model.AlertStatus;
import com.bitflow.backend.model.PriceAlert;
import com.bitflow.backend.model.User;
import com.bitflow.backend.repository.PriceAlertRepository;
import com.bitflow.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PriceAlertService {

    @Autowired
    private PriceAlertRepository priceAlertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public PriceAlert createAlert(Long userId, PriceAlertRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PriceAlert alert = new PriceAlert(user, request.getSymbol(), request.getTargetPrice(), request.getCondition());
        return priceAlertRepository.save(alert);
    }

    public List<PriceAlert> getAlertsForUser(Long userId) {
        return priceAlertRepository.findByUserId(userId);
    }

    public void checkAlerts(Map<String, Double> currentPrices) {
        List<PriceAlert> activeAlerts = priceAlertRepository.findAll(); 

        for (PriceAlert alert : activeAlerts) {
            if (alert.getStatus() != AlertStatus.ACTIVE)
                continue;

            String symbol = alert.getSymbol().toLowerCase();
            Double price = currentPrices.get(symbol);
            if (price == null)
                continue;

            boolean triggered = false;
            if (alert.getCondition() == AlertCondition.ABOVE && price >= alert.getTargetPrice()) {
                triggered = true;
            } else if (alert.getCondition() == AlertCondition.BELOW && price <= alert.getTargetPrice()) {
                triggered = true;
            }

            if (triggered) {
                alert.setStatus(AlertStatus.TRIGGERED);
                priceAlertRepository.save(alert);
                sendNotification(alert, price);
            }
        }
    }

    private void sendNotification(PriceAlert alert, Double currentPrice) {
        AlertNotification notification = new AlertNotification(
                alert.getUser().getId(),
                "Price Alert: " + alert.getSymbol().toUpperCase() + " hit " + currentPrice,
                alert.getId(),
                alert.getSymbol(),
                currentPrice);
        messagingTemplate.convertAndSend("/topic/alerts", notification);
    }

    public static class AlertNotification {
        public Long userId;
        public String message;
        public Long alertId;
        public String symbol;
        public Double price;

        public AlertNotification(Long userId, String message, Long alertId, String symbol, Double price) {
            this.userId = userId;
            this.message = message;
            this.alertId = alertId;
            this.symbol = symbol;
            this.price = price;
        }
    }
}
