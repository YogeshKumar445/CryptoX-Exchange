package com.cryptox.service;
import com.cryptox.dto.response.ApiResponse;
public interface WatchlistService {
    ApiResponse getMyWatchlist();
    ApiResponse addToWatchlist(Long coinId);
    ApiResponse removeFromWatchlist(Long coinId);
    boolean isFavorite(Long coinId);
}