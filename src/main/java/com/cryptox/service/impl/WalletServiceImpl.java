package com.cryptox.service.impl;

import com.cryptox.entity.User;
import com.cryptox.entity.Wallet;
import com.cryptox.exception.ResourceNotFoundException;
import com.cryptox.repository.UserRepository;
import com.cryptox.repository.WalletRepository;
import com.cryptox.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import com.cryptox.dto.response.ApiResponse;
import com.cryptox.dto.response.WalletResponse;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import com.cryptox.exception.InsufficientBalanceException;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    @Override
    public Wallet createWallet(User user) {

        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO)
                .build();

        return walletRepository.save(wallet);
    }

    @Override
    public ApiResponse getMyWallet(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Wallet not found"));

        WalletResponse response = WalletResponse.builder()
                .id(wallet.getId())
                .balance(wallet.getBalance())
                .userId(user.getId())
                .build();

        return ApiResponse.builder()
                .success(true)
                .message("Wallet fetched successfully")
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse deposit(String email, BigDecimal amount) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Wallet not found"));

        wallet.setBalance(wallet.getBalance().add(amount));

        walletRepository.save(wallet);

        WalletResponse response = WalletResponse.builder()
                .id(wallet.getId())
                .userId(user.getId())
                .balance(wallet.getBalance())
                .updatedAt(wallet.getUpdatedAt())
                .build();

        return ApiResponse.builder()
                .success(true)
                .message("Amount deposited successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse withdraw(String email, BigDecimal amount) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Wallet not found"));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));

        walletRepository.save(wallet);

        WalletResponse response = WalletResponse.builder()
                .id(wallet.getId())
                .userId(user.getId())
                .balance(wallet.getBalance())
                .updatedAt(wallet.getUpdatedAt())
                .build();

        return ApiResponse.builder()
                .success(true)
                .message("Amount withdrawn successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }
}