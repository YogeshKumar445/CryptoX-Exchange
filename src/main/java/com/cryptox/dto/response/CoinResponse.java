package com.cryptox.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoinResponse {

    private Long id;
    private String symbol;
    private String name;
    private Double currentPrice;
    private String imageUrl;
}
