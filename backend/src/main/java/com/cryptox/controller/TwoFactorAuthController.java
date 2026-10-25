package com.cryptox.controller;

import com.cryptox.dto.request.TwoFactorDisableRequest;
import com.cryptox.dto.request.TwoFactorLoginVerifyRequest;
import com.cryptox.dto.request.TwoFactorVerifyRequest;
import com.cryptox.dto.response.ApiResponse;
import com.cryptox.dto.response.LoginResponse;
import com.cryptox.dto.response.TwoFactorSetupResponse;
import com.cryptox.entity.User;
import com.cryptox.exception.AccountLockedException;
import com.cryptox.repository.UserRepository;
import com.cryptox.security.jwt.JwtService;
import com.cryptox.service.OtpVerificationService;
import com.cryptox.service.TwoFactorAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth/2fa")
@RequiredArgsConstructor
public class TwoFactorAuthController {

    private final TwoFactorAuthService twoFactorAuthService;
    private final OtpVerificationService otpVerificationService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    private ApiResponse failure(String message) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping("/setup")
    public ApiResponse setup(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            return ApiResponse.builder()
                    .success(false)
                    .message("Two-factor authentication is already enabled. Disable it first to set it up again.")
                    .data(null)
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        TwoFactorSetupResponse setupResponse =
                twoFactorAuthService.generateSetup(email);

        user.setTwoFactorSecret(setupResponse.getSecret());
        userRepository.save(user);

        return ApiResponse.builder()
                .success(true)
                .message("Scan this QR code with your authenticator app")
                .data(setupResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping("/verify")
    public ApiResponse verify(
            @Valid @RequestBody TwoFactorVerifyRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getTwoFactorSecret() == null) {
            return ApiResponse.builder()
                    .success(false)
                    .message("2FA setup not initiated. Please call /setup first.")
                    .data(null)
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        boolean isValid = twoFactorAuthService.verifyCode(
                user.getTwoFactorSecret(),
                request.getCode()
        );

        if (!isValid) {
            return ApiResponse.builder()
                    .success(false)
                    .message("Invalid or expired code. Please try again.")
                    .data(null)
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        user.setTwoFactorEnabled(true);
        userRepository.save(user);

        return ApiResponse.builder()
                .success(true)
                .message("Two-factor authentication enabled successfully.")
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping("/disable")
    public ApiResponse disable(
            @Valid @RequestBody TwoFactorDisableRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            return failure("Two-factor authentication is not enabled.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return failure("Incorrect password.");
        }

        try {
            otpVerificationService.verifyOtp(email, request.getCode());
        } catch (IllegalArgumentException | AccountLockedException e) {
            return failure(e.getMessage());
        }

        // verifyOtp ne user ko update kiya ho sakta hai, isliye fresh load
        User freshUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        freshUser.setTwoFactorEnabled(false);
        freshUser.setTwoFactorSecret(null);
        userRepository.save(freshUser);

        return ApiResponse.builder()
                .success(true)
                .message("Two-factor authentication disabled successfully.")
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PostMapping("/login-verify")
    public ApiResponse loginVerify(
            @Valid @RequestBody TwoFactorLoginVerifyRequest request
    ) {

        String purpose;
        String email;

        try {
            purpose = jwtService.extractPurpose(request.getTempToken());
            email = jwtService.extractUsername(request.getTempToken());
        } catch (Exception e) {
            return failure("Invalid or expired session. Please login again.");
        }

        if (!"2fa_pending".equals(purpose)) {
            return failure("Invalid session token.");
        }

        try {
            otpVerificationService.verifyOtp(email, request.getCode());
        } catch (IllegalArgumentException | AccountLockedException e) {
            return failure(e.getMessage());
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getEmail());

        LoginResponse response = LoginResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .token(token)
                .build();

        return ApiResponse.builder()
                .success(true)
                .message("Login successful")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }
}