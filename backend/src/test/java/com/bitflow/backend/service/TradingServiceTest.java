package com.bitflow.backend.service;

import com.bitflow.backend.exception.BusinessException;
import com.bitflow.backend.model.*;
import com.bitflow.backend.repository.OrderRepository;
import com.bitflow.backend.repository.UserRepository;
import com.bitflow.backend.repository.WalletRepository;
import com.bitflow.backend.dto.OrderRequest;
import com.bitflow.backend.service.strategy.OrderProcessingStrategy;
import com.bitflow.backend.service.strategy.OrderStrategyFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TradingServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderStrategyFactory orderStrategyFactory;

    @InjectMocks
    private TradingService tradingService;

    private User testUser;
    private Wallet testWallet;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "test@example.com", "password");
        testUser.setId(1L);

        testWallet = new Wallet(testUser);
        testWallet.setId(1L);
        testWallet.getAssets().add(new Asset("USD", 1000.0, testWallet));
    }

    @Test
    void depositFunds_Success() {
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(testWallet));
        when(walletRepository.save(any(Wallet.class))).thenReturn(testWallet);

        Wallet updatedWallet = tradingService.depositFunds(1L, 500.0);

        assertNotNull(updatedWallet);
        Asset usd = updatedWallet.getAssets().stream()
                .filter(a -> a.getSymbol().equals("USD"))
                .findFirst()
                .orElseThrow();
        assertEquals(1500.0, usd.getQuantity());
    }

    @Test
    void depositFunds_NegativeAmount_ThrowsException() {
        assertThrows(BusinessException.class, () -> {
            tradingService.depositFunds(1L, -100.0);
        });
    }

    @Test
    void placeOrder_DelegatesToStrategy() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(testWallet));

        OrderProcessingStrategy mockStrategy = mock(OrderProcessingStrategy.class);
        when(orderStrategyFactory.getStrategy(OrderCategory.MARKET)).thenReturn(mockStrategy);

        Order expectedOrder = new Order();
        expectedOrder.setStatus(OrderStatus.FILLED);
        when(mockStrategy.processOrder(any(OrderRequest.class), any(User.class), any(Wallet.class)))
                .thenReturn(expectedOrder);

        when(orderRepository.save(any(Order.class))).thenReturn(expectedOrder);

        Order result = tradingService.placeOrder(1L, "BTC", OrderType.BUY, OrderCategory.MARKET, 0.01, null);

        assertNotNull(result);
        assertEquals(OrderStatus.FILLED, result.getStatus());
        verify(mockStrategy).processOrder(any(OrderRequest.class), eq(testUser), eq(testWallet));
    }

    @Test
    void placeOrder_UnsupportedCategory_ThrowsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(testWallet));

        when(orderStrategyFactory.getStrategy(any())).thenReturn(null);

        assertThrows(BusinessException.class, () -> {
            tradingService.placeOrder(1L, "BTC", OrderType.BUY, OrderCategory.MARKET, 1.0, null);
        });
    }
}
