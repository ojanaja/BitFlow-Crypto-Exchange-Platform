package com.bitflow.backend.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String walletAddress; 
    private String signature; 
    private String message; 
}
