package com.cryptox.service.impl;

import com.cryptox.dto.response.CoinResponse;
import com.cryptox.entity.Coin;
import com.cryptox.exception.ResourceAlreadyExistsException;
import com.cryptox.exception.ResourceNotFoundException;
import com.cryptox.repository.CoinRepository;
import com.cryptox.service.CoinService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import com.cryptox.client.CoinGeckoClient;
import com.cryptox.dto.external.CoinGeckoCoinResponse;

@Service
@RequiredArgsConstructor
public class CoinServiceImpl implements CoinService {

    private final CoinRepository coinRepository;

    private final CoinGeckoClient coinGeckoClient;

    @Override
    public CoinResponse saveCoin(CoinResponse coinResponse) {

        if (coinRepository.existsBySymbol(coinResponse.getSymbol())) {
            throw new ResourceAlreadyExistsException("Coin already exists");
        }

        Coin coin = Coin.builder()
                .symbol(coinResponse.getSymbol())
                .name(coinResponse.getName())
                .currentPrice(coinResponse.getCurrentPrice())
                .imageUrl(coinResponse.getImageUrl())
                .build();

        Coin savedCoin = coinRepository.save(coin);

        return CoinResponse.builder()
                .id(savedCoin.getId())
                .symbol(savedCoin.getSymbol())
                .name(savedCoin.getName())
                .currentPrice(savedCoin.getCurrentPrice())
                .imageUrl(savedCoin.getImageUrl())
                .build();
    }

    @Override
    public List<CoinResponse> getAllCoins() {

        return coinRepository.findAll()
                .stream()
                .map(coin -> CoinResponse.builder()
                        .id(coin.getId())
                        .symbol(coin.getSymbol())
                        .name(coin.getName())
                        .currentPrice(coin.getCurrentPrice())
                        .imageUrl(coin.getImageUrl())
                        .build())
                .toList();
    }

    @Override
    public CoinResponse getCoinBySymbol(String symbol) {

        Coin coin = coinRepository.findBySymbol(symbol)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Coin not found"));

        return CoinResponse.builder()
                .id(coin.getId())
                .symbol(coin.getSymbol())
                .name(coin.getName())
                .currentPrice(coin.getCurrentPrice())
                .imageUrl(coin.getImageUrl())
                .build();
    }
    @Override
    public List<CoinGeckoCoinResponse> fetchTopCoins() {
        return coinGeckoClient.fetchTopCoins();
    }
    @Override
    public void syncTopCoins() {

        List<CoinGeckoCoinResponse> coins =
                coinGeckoClient.fetchTopCoins();

        for (CoinGeckoCoinResponse response : coins) {

            Coin coin = coinRepository.findBySymbol(
                    response.getSymbol().toUpperCase()
            ).orElse(new Coin());

            coin.setSymbol(response.getSymbol().toUpperCase());
            coin.setName(response.getName());
            coin.setCurrentPrice(response.getCurrentPrice());
            coin.setImageUrl(response.getImage());

            coinRepository.save(coin);
        }
    }
}