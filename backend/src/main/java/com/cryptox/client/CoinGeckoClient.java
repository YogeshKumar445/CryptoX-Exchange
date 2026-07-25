package com.cryptox.client;

import com.cryptox.constants.ApiConstants;
import com.cryptox.dto.external.CoinGeckoCoinResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CoinGeckoClient {

    private final RestClient restClient;

    public List<CoinGeckoCoinResponse> fetchTopCoins() {

        return restClient.get()
                .uri(ApiConstants.COINGECKO_BASE_URL + ApiConstants.TOP_COINS)
                .retrieve()
                .body(new ParameterizedTypeReference<List<CoinGeckoCoinResponse>>() {});
    }
}