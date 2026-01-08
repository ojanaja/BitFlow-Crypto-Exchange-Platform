package com.bitflow.backend.repository;

import com.bitflow.backend.model.AlertStatus;
import com.bitflow.backend.model.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {
    List<PriceAlert> findBySymbolAndStatus(String symbol, AlertStatus status);

    List<PriceAlert> findByUserId(Long userId);
}
