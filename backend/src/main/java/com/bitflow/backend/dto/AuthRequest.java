package com.bitflow.backend.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String walletAddress; // Base58 public key
    private String signature; // Base58 signature
    private String message; // The message that was signed (e.g. "Login to BitFlow: <timestamp>")
}
