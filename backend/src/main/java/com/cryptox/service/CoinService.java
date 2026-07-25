package com.cryptox.service;

import com.cryptox.dto.response.CoinResponse;

import java.util.List;
import com.cryptox.dto.external.CoinGeckoCoinResponse;

public interface CoinService {
    void syncTopCoins();

    List<CoinGeckoCoinResponse> fetchTopCoins();

    CoinResponse saveCoin(CoinResponse coinResponse);

    List<CoinResponse> getAllCoins();

    CoinResponse getCoinBySymbol(String symbol);

}

