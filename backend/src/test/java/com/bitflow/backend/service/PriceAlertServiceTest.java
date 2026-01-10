package com.bitflow.backend.service;

import com.bitflow.backend.dto.PriceAlertRequest;
import com.bitflow.backend.model.*;
import com.bitflow.backend.repository.PriceAlertRepository;
import com.bitflow.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PriceAlertServiceTest {

    @Mock
    private PriceAlertRepository priceAlertRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private PriceAlertService priceAlertService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
    }

    @Test
    void createAlert_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(priceAlertRepository.save(any(PriceAlert.class))).thenAnswer(i -> i.getArguments()[0]);

        PriceAlertRequest req = new PriceAlertRequest();
        req.setSymbol("BTC");
        req.setTargetPrice(50000.0);
        req.setCondition(AlertCondition.ABOVE);

        PriceAlert alert = priceAlertService.createAlert(1L, req);

        assertNotNull(alert);
        assertEquals("BTC", alert.getSymbol());
        assertEquals(50000.0, alert.getTargetPrice());
        assertEquals(AlertStatus.ACTIVE, alert.getStatus());
    }

    @Test
    void checkAlerts_Triggered() {
        PriceAlert alert = new PriceAlert(testUser, "BTC", 50000.0, AlertCondition.ABOVE);
        alert.setStatus(AlertStatus.ACTIVE);

        when(priceAlertRepository.findAll()).thenReturn(List.of(alert));

        Map<String, Double> currentPrices = new HashMap<>();
        currentPrices.put("btc", 51000.0);

        priceAlertService.checkAlerts(currentPrices);

        verify(priceAlertRepository).save(any(PriceAlert.class));
        assertEquals(AlertStatus.TRIGGERED, alert.getStatus());
        verify(messagingTemplate).convertAndSend(eq("/topic/alerts"), any(PriceAlertService.AlertNotification.class));
    }

    @Test
    void checkAlerts_NotTriggered() {
        PriceAlert alert = new PriceAlert(testUser, "BTC", 50000.0, AlertCondition.ABOVE);
        alert.setStatus(AlertStatus.ACTIVE);

        when(priceAlertRepository.findAll()).thenReturn(List.of(alert));

        Map<String, Double> currentPrices = new HashMap<>();
        currentPrices.put("btc", 49000.0);

        priceAlertService.checkAlerts(currentPrices);

        verify(priceAlertRepository, never()).save(any(PriceAlert.class));
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }
}
