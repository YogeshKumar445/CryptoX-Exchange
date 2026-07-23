package com.cryptox.controller;

import com.cryptox.dto.request.DepositRequest;
import com.cryptox.dto.request.WithdrawRequest;
import com.cryptox.dto.response.ApiResponse;
import com.cryptox.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/deposit")
    public ApiResponse deposit(
            @Valid @RequestBody DepositRequest request,
            Authentication authentication
    ) {

        return walletService.deposit(
                authentication.getName(),
                request.getAmount()
        );
    }

    @PostMapping("/withdraw")
    public ApiResponse withdraw(
            Authentication authentication,
            @Valid @RequestBody WithdrawRequest request
    ) {

        String email = authentication.getName();

        return walletService.withdraw(
                email,
                request.getAmount()
        );
    }
}