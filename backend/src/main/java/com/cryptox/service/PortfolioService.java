package com.cryptox.service;

import com.cryptox.dto.request.SellCoinRequest;
import com.cryptox.dto.response.PortfolioResponse;

import java.util.List;
import com.cryptox.dto.request.BuyCoinRequest;

public interface PortfolioService {

    List<PortfolioResponse> getMyPortfolio();

    void buyCoin(BuyCoinRequest request);
    void sellCoin(SellCoinRequest request);

}
