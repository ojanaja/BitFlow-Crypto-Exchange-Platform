package com.bitflow.backend.controller;

import com.bitflow.backend.dto.JwtResponse;
import com.bitflow.backend.dto.LoginRequest;
import com.bitflow.backend.dto.MessageResponse;
import com.bitflow.backend.dto.RegisterRequest;
import com.bitflow.backend.model.User;
import com.bitflow.backend.repository.UserRepository;
import com.bitflow.backend.security.jwt.JwtUtils;
import com.bitflow.backend.security.services.UserDetailsImpl;
import com.bitflow.backend.security.SolanaAuthenticationProvider;
import com.bitflow.backend.dto.AuthRequest;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        UserRepository userRepository;

        @Autowired
        PasswordEncoder encoder;

        @Autowired
        JwtUtils jwtUtils;

        @Autowired
        SolanaAuthenticationProvider solanaAuthenticationProvider;

        @PostMapping("/login")
        public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

                String role = userDetails.getAuthorities().stream()
                                .findFirst().get().getAuthority();

                return ResponseEntity.ok(new JwtResponse(jwt,
                                userDetails.getId(),
                                userDetails.getUsername(),
                                userDetails.getEmail(),
                                role));
        }

        @PostMapping("/register")
        public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
                if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(new MessageResponse("Error: Username is already taken!"));
                }

                if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(new MessageResponse("Error: Email is already in use!"));
                }

                User user = new User(signUpRequest.getUsername(),
                                signUpRequest.getEmail(),
                                encoder.encode(signUpRequest.getPassword()));

                userRepository.save(user);

                return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        }

        @PostMapping("/wallet-login")
        public ResponseEntity<?> authenticateWallet(@RequestBody AuthRequest authRequest) {
                boolean isValid = solanaAuthenticationProvider.isValidSignature(
                                authRequest.getWalletAddress(),
                                authRequest.getMessage(),
                                authRequest.getSignature());

                if (!isValid) {
                        return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid Wallet Signature"));
                }

                String walletAddress = authRequest.getWalletAddress();
                if (!userRepository.existsByUsername(walletAddress)) {
                        User user = new User(
                                        walletAddress,
                                        walletAddress + "@bitflow.app",
                                        encoder.encode(UUID.randomUUID().toString())); 
                        userRepository.save(user);
                }

                User user = userRepository.findByUsername(walletAddress)
                                .orElseThrow(() -> new RuntimeException("Error: User not found."));

                UserDetailsImpl userDetails = new UserDetailsImpl(
                                user.getId(),
                                user.getUsername(),
                                user.getEmail(),
                                user.getPassword(),
                                java.util.Collections.singletonList(
                                                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                                user.getRole())));

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                return ResponseEntity.ok(new JwtResponse(jwt,
                                userDetails.getId(),
                                userDetails.getUsername(),
                                userDetails.getEmail(),
                                "ROLE_USER"));
        }
}
