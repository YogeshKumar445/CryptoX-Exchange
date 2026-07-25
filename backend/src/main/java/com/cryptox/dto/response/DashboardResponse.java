package com.cryptox.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private Double walletBalance;

    private Double portfolioValue;

    private Double totalInvestment;

    private Double totalProfitLoss;

    private Integer coinsOwned;

    private Long totalTransactions;

}
