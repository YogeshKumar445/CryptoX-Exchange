package com.cryptox.service;

import com.cryptox.dto.response.ApiResponse;
import com.cryptox.entity.User;
import com.cryptox.entity.Wallet;

import java.math.BigDecimal;

public interface WalletService {

    Wallet createWallet(User user);


    ApiResponse getMyWallet(String email);

    ApiResponse deposit(String email, BigDecimal amount);

    ApiResponse withdraw(String email, BigDecimal amount);
}