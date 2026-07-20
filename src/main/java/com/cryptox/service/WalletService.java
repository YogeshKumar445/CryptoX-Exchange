package com.cryptox.service;

import com.cryptox.dto.response.ApiResponse;
import com.cryptox.entity.User;
import com.cryptox.entity.Wallet;

public interface WalletService {

    // Registration ke time wallet create karega
    Wallet createWallet(User user);

    // Internal use ke liye
    Wallet getWallet(Long userId);

    // JWT se logged-in user ka wallet fetch karega
    ApiResponse getMyWallet(String email);
}