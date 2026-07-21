package com.cryptox.service;

import com.cryptox.dto.response.CoinResponse;

import java.util.List;

public interface CoinService {

    CoinResponse saveCoin(CoinResponse coinResponse);

    List<CoinResponse> getAllCoins();

    CoinResponse getCoinBySymbol(String symbol);

}
