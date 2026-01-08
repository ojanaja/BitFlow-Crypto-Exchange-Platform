package com.bitflow.backend.security;

import org.p2p.solanaj.core.PublicKey;
import org.p2p.solanaj.utils.TweetNaclFast;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class SolanaAuthenticationProvider {

    public boolean isValidSignature(String walletAddress, String message, String signature) {
        try {
            PublicKey publicKey = new PublicKey(walletAddress);
            byte[] pubKeyBytes = publicKey.toByteArray();

            // Phantom wallet signs the message bytes directly or sometimes wrapped.
            // Standard: message bytes.
            byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);

            // Signature is Base58 encoded usually from Phantom?
            // Most libs return Base58 signature. DTO says Base58.
            // Solanaj doesn't have a Base58 decoder public immediately accessible?
            // PublicKey does implementation of Base58 decoding.
            // Use BitcoinJ or similar if available, otherwise assuming Solanaj pulls in
            // one.
            // Actually, PublicKey constructor uses Base58.decode(String).
            // But we need to decode the signature which is also Base58.
            // Let's rely on org.bitcoinj.core.Base58 if Solanaj brings it.

            byte[] signatureBytes = org.bitcoinj.core.Base58.decode(signature);

            TweetNaclFast.Signature provider = new TweetNaclFast.Signature(pubKeyBytes, null);
            return provider.detached_verify(messageBytes, signatureBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
