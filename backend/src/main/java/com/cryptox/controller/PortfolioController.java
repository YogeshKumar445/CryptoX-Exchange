package com.cryptox.controller;

import com.cryptox.dto.request.BuyCoinRequest;
import com.cryptox.dto.request.SellCoinRequest;
import com.cryptox.dto.response.PortfolioResponse;
import com.cryptox.service.PortfolioService;
import com.cryptox.service.TransactionPinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final TransactionPinService transactionPinService;

    @GetMapping("/me")
    public ResponseEntity<List<PortfolioResponse>> getMyPortfolio() {
        return ResponseEntity.ok(portfolioService.getMyPortfolio());
    }

    @PostMapping("/buy")
    public ResponseEntity<String> buyCoin(
            @Valid @RequestBody BuyCoinRequest request,
            Authentication authentication
    ) {

        transactionPinService.verifyPin(
                authentication.getName(),
                request.getPin()
        );

        portfolioService.buyCoin(request);

        return ResponseEntity.ok("Coin purchased successfully");
    }

    @PostMapping("/sell")
    public ResponseEntity<String> sellCoin(
            @Valid @RequestBody SellCoinRequest request,
            Authentication authentication
    ) {

        transactionPinService.verifyPin(
                authentication.getName(),
                request.getPin()
        );

        portfolioService.sellCoin(request);

        return ResponseEntity.ok("Coin sold successfully");
    }
}