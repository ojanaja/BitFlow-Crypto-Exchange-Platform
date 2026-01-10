package com.bitflow.backend.service.strategy;

import com.bitflow.backend.dto.OrderRequest;
import com.bitflow.backend.model.*;
import com.bitflow.backend.repository.WalletRepository;
import com.bitflow.backend.service.MarketDataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarketOrderStrategyTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private MarketDataService marketDataService;

    @InjectMocks
    private MarketOrderStrategy marketOrderStrategy;

    private User testUser;
    private Wallet testWallet;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testWallet = new Wallet(testUser);
        testWallet.getAssets().add(new Asset("USD", 1000.0, testWallet));
    }

    @Test
    void processOrder_Buy_Success() {
        Map<String, Double> prices = new HashMap<>();
        prices.put("btc", 50000.0);
        when(marketDataService.getLatestPrices()).thenReturn(prices);

        OrderRequest request = new OrderRequest();
        request.setSymbol("BTC");
        request.setType(OrderType.BUY);
        request.setQuantity(0.01);

        Order order = marketOrderStrategy.processOrder(request, testUser, testWallet);

        assertNotNull(order);
        assertEquals(OrderStatus.FILLED, order.getStatus());
        assertEquals(50000.0, order.getPrice());

        verify(walletRepository).save(testWallet);
    }
}
