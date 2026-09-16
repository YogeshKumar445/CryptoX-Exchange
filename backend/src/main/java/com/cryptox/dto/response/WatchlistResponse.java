package com.cryptox.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistResponse {

    private Long id;
    private Long coinId;
    private String symbol;
    private String name;
    private String imageUrl;
    private Double currentPrice;
    private Double priceChange24h;
    private Double priceChangePercentage24h;
    private Boolean favorite;
}