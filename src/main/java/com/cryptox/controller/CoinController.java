package com.cryptox.controller;

import com.cryptox.dto.response.ApiResponse;
import com.cryptox.dto.response.CoinResponse;
import com.cryptox.service.CoinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/coins")
@RequiredArgsConstructor
public class CoinController {

    private final CoinService coinService;

    @PostMapping
    public ResponseEntity<ApiResponse<CoinResponse>> saveCoin(
            @RequestBody CoinResponse coinResponse
    ) {

        CoinResponse savedCoin = coinService.saveCoin(coinResponse);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.<CoinResponse>builder()
                                .success(true)
                                .message("Coin added successfully")
                                .data(savedCoin)
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CoinResponse>>> getAllCoins() {

        List<CoinResponse> coins = coinService.getAllCoins();

        return ResponseEntity.ok(
                ApiResponse.<List<CoinResponse>>builder()
                        .success(true)
                        .message("Coins fetched successfully")
                        .data(coins)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<ApiResponse<CoinResponse>> getCoinBySymbol(
            @PathVariable String symbol
    ) {

        CoinResponse coin = coinService.getCoinBySymbol(symbol);

        return ResponseEntity.ok(
                ApiResponse.<CoinResponse>builder()
                        .success(true)
                        .message("Coin fetched successfully")
                        .data(coin)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}