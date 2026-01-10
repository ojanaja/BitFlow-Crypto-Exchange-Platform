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

            byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
            byte[] signatureBytes = org.bitcoinj.core.Base58.decode(signature);

            TweetNaclFast.Signature provider = new TweetNaclFast.Signature(pubKeyBytes, null);
            return provider.detached_verify(messageBytes, signatureBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
