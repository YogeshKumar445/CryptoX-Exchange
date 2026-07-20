package com.cryptox.controller;

import com.cryptox.dto.response.ApiResponse;
import com.cryptox.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/me")
    public ApiResponse getMyWallet(Authentication authentication) {

        String email = authentication.getName();

        return walletService.getMyWallet(email);
    }
}