package com.cryptox.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class WalletResponse {

    private Long id;
    private BigDecimal balance;
    private Long userId;
}