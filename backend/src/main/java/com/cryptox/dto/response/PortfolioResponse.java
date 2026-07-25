package com.cryptox.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioResponse {

    private Long coinId;

    private String symbol;

    private String coinName;

    private String imageUrl;

    private Double quantity;

    private Double averageBuyPrice;

    private Double currentPrice;

    private Double totalInvestment;

    private Double currentValue;

    private Double profitOrLoss;
}
