package com.cryptox.service.impl;

import com.cryptox.dto.response.ApiResponse;
import com.cryptox.dto.response.WatchlistResponse;
import com.cryptox.entity.Coin;
import com.cryptox.entity.User;
import com.cryptox.entity.Watchlist;
import com.cryptox.exception.ResourceNotFoundException;
import com.cryptox.repository.CoinRepository;
import com.cryptox.repository.WatchlistRepository;
import com.cryptox.service.AuthenticationService;
import com.cryptox.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WatchlistServiceImpl implements WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final CoinRepository coinRepository;
    private final AuthenticationService authenticationService;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse getMyWatchlist() {

        User user = authenticationService.getCurrentUser();

        List<WatchlistResponse> response =
                watchlistRepository.findByUser(user)
                        .stream()
                        .map(this::mapToResponse)
                        .toList();

        return ApiResponse.builder()
                .success(true)
                .message("Watchlist fetched successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse addToWatchlist(Long coinId) {

        User user = authenticationService.getCurrentUser();

        Coin coin = coinRepository.findById(coinId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Coin not found"));

        if (watchlistRepository.existsByUserAndCoin(user, coin)) {
            return ApiResponse.builder()
                    .success(false)
                    .message("Coin already exists in watchlist")
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        Watchlist watchlist = Watchlist.builder()
                .user(user)
                .coin(coin)
                .build();

        watchlistRepository.save(watchlist);

        return ApiResponse.builder()
                .success(true)
                .message("Coin added to watchlist")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse removeFromWatchlist(Long coinId) {

        User user = authenticationService.getCurrentUser();

        Coin coin = coinRepository.findById(coinId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Coin not found"));

        watchlistRepository.deleteByUserAndCoin(user, coin);

        return ApiResponse.builder()
                .success(true)
                .message("Coin removed from watchlist")
                .timestamp(LocalDateTime.now())
                .build();
    }


    @Override
    public boolean isFavorite(Long coinId) {

        User user = authenticationService.getCurrentUser();

        Coin coin = coinRepository.findById(coinId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Coin not found"));

        return watchlistRepository.existsByUserAndCoin(user, coin);
    }

    private WatchlistResponse mapToResponse(Watchlist watchlist) {

        Coin coin = watchlist.getCoin();

        return WatchlistResponse.builder()
                .id(watchlist.getId())
                .coinId(coin.getId())
                .symbol(coin.getSymbol())
                .name(coin.getName())
                .imageUrl(coin.getImageUrl())
                .currentPrice(coin.getCurrentPrice())
                .priceChange24h(null)
                .priceChangePercentage24h(null)
                .favorite(true)
                .build();
    }
}