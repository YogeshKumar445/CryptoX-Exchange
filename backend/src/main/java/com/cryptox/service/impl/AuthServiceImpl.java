package com.cryptox.service.impl;

import com.cryptox.dto.request.LoginRequest;
import com.cryptox.dto.request.RegisterRequest;
import com.cryptox.dto.response.ApiResponse;
import com.cryptox.dto.response.LoginResponse;
import com.cryptox.entity.User;
import com.cryptox.enums.UserRole;
import com.cryptox.exception.ResourceAlreadyExistsException;
import com.cryptox.exception.ResourceNotFoundException;
import com.cryptox.exception.AccountDisabledException;
import com.cryptox.exception.AccountLockedException;
import com.cryptox.repository.UserRepository;
import com.cryptox.security.jwt.JwtService;
import com.cryptox.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import com.cryptox.service.WalletService;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final WalletService walletService;

    @Override
    public ApiResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ResourceAlreadyExistsException("Phone number already exists");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        walletService.createWallet(savedUser);

        return ApiResponse.builder()
                .success(true)
                .message("User registered successfully")
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 15;

    @Override
    public ApiResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invalid email or password"));

        // Check if account is currently locked
        if (user.getLockedUntil() != null &&
                user.getLockedUntil().isAfter(LocalDateTime.now())) {

            long minutesLeft = java.time.Duration.between(
                    LocalDateTime.now(), user.getLockedUntil()
            ).toMinutes() + 1;

            throw new AccountLockedException(
                    "Account temporarily locked due to multiple failed login attempts. " +
                            "Try again after " + minutesLeft + " minute(s)."
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {

            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(
                        LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES)
                );
                user.setFailedLoginAttempts(0);
                userRepository.save(user);

                throw new AccountLockedException(
                        "Too many failed login attempts. Account locked for " +
                                LOCK_DURATION_MINUTES + " minutes."
                );
            }

            userRepository.save(user);
            throw new ResourceNotFoundException("Invalid email or password");
        }

        if (!user.getActive()) {
            throw new AccountDisabledException(
                    "Your account has been disabled. Please contact support."
            );
        }

        // Successful login - reset failed attempts
        if (user.getFailedLoginAttempts() > 0 || user.getLockedUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);
        }

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