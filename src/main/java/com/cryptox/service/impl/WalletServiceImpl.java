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
    public Wallet getWallet(Long userId) {

        return walletRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Wallet not found"));
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
}