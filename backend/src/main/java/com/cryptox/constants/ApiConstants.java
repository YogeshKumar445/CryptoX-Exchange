package com.cryptox.constants;

public class ApiConstants {

    private ApiConstants() {
    }

    public static final String COINGECKO_BASE_URL =
            "https://api.coingecko.com/api/v3";

    public static final String TOP_COINS =
            "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";
}
