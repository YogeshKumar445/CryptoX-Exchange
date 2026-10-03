package com.cryptox.controller;

import com.cryptox.dto.response.ApiResponse;
import com.cryptox.dto.response.TwoFactorSetupResponse;
import com.cryptox.entity.User;
import com.cryptox.repository.UserRepository;
import com.cryptox.service.TwoFactorAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth/2fa")
@RequiredArgsConstructor
public class TwoFactorAuthController {

    private final TwoFactorAuthService twoFactorAuthService;
    private final UserRepository userRepository;

    @PostMapping("/setup")
    public ApiResponse setup(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        TwoFactorSetupResponse setupResponse =
                twoFactorAuthService.generateSetup(email);

        // Save the secret temporarily (not yet enabled until verified)
        user.setTwoFactorSecret(setupResponse.getSecret());
        userRepository.save(user);

        return ApiResponse.builder()
                .success(true)
                .message("Scan this QR code with your authenticator app")
                .data(setupResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }
}