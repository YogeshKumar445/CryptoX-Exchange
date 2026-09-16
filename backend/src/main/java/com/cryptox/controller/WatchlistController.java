package com.cryptox.controller;

import com.cryptox.dto.response.ApiResponse;
import com.cryptox.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public ApiResponse getMyWatchlist() {
        return watchlistService.getMyWatchlist();
    }

    @PostMapping("/{coinId}")
    public ApiResponse addToWatchlist(
            @PathVariable Long coinId
    ) {
        return watchlistService.addToWatchlist(coinId);
    }

    @DeleteMapping("/{coinId}")
    public ApiResponse removeFromWatchlist(
            @PathVariable Long coinId
    ) {
        return watchlistService.removeFromWatchlist(coinId);
    }

    @GetMapping("/check/{coinId}")
    public boolean isFavorite(
            @PathVariable Long coinId
    ) {
        return watchlistService.isFavorite(coinId);
    }
}