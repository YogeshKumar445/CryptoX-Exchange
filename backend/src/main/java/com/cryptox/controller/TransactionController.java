package com.cryptox.controller;

import com.cryptox.dto.response.ApiResponse;
import com.cryptox.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/me")
    public ApiResponse getMyTransactions(Authentication authentication) {

        String email = authentication.getName();

        return transactionService.getMyTransactions(email);
    }
}