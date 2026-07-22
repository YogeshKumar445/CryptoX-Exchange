package com.cryptox.controller;

import com.cryptox.dto.request.BuyCoinRequest;
import com.cryptox.dto.response.PortfolioResponse;
import com.cryptox.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/me")
    public ResponseEntity<List<PortfolioResponse>> getMyPortfolio() {
        return ResponseEntity.ok(portfolioService.getMyPortfolio());
    }

    @PostMapping("/buy")
    public ResponseEntity<String> buyCoin(
            @Valid @RequestBody BuyCoinRequest request
    ) {

        portfolioService.buyCoin(request);

        return ResponseEntity.ok("Coin purchased successfully");
    }
}