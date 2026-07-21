package com.cryptox.dto.external;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CoinGeckoCoinResponse {

    private String id;

    private String symbol;

    private String name;

    @JsonProperty("current_price")
    private Double currentPrice;

    private String image;
}