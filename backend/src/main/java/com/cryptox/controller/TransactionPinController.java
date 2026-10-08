package com.cryptox.controller;

import com.cryptox.dto.request.SetTransactionPinRequest;
import com.cryptox.dto.response.ApiResponse;
import com.cryptox.entity.User;
import com.cryptox.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/pin")
@RequiredArgsConstructor
public class TransactionPinController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/status")
    public ApiResponse status(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        boolean hasPin = user.getTransactionPinHash() != null;

        return ApiResponse.builder()
                .success(true)
                .message("Transaction PIN status fetched")
                .data(Map.of("hasTransactionPin", hasPin))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping("/set")
    public ApiResponse setPin(
            @Valid @RequestBody SetTransactionPinRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ApiResponse.builder()
                    .success(false)
                    .message("Incorrect password.")
                    .data(null)
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        boolean hadPin = user.getTransactionPinHash() != null;

        user.setTransactionPinHash(passwordEncoder.encode(request.getPin()));
        userRepository.save(user);

        return ApiResponse.builder()
                .success(true)
                .message(hadPin
                        ? "Transaction PIN changed successfully."
                        : "Transaction PIN set successfully.")
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}