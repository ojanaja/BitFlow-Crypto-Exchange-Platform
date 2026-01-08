package com.bitflow.backend.controller;

import com.bitflow.backend.dto.PriceAlertRequest;
import com.bitflow.backend.model.PriceAlert;
import com.bitflow.backend.security.services.UserDetailsImpl;
import com.bitflow.backend.service.PriceAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class PriceAlertController {

    @Autowired
    private PriceAlertService priceAlertService;

    @PostMapping
    public ResponseEntity<PriceAlert> createAlert(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody PriceAlertRequest request) {
        PriceAlert alert = priceAlertService.createAlert(userDetails.getId(), request);
        return ResponseEntity.ok(alert);
    }

    @GetMapping
    public ResponseEntity<List<PriceAlert>> getAlerts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(priceAlertService.getAlertsForUser(userDetails.getId()));
    }
}
