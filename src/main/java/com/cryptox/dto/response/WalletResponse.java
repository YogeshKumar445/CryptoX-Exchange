package com.cryptox.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class WalletResponse {

    private Long id;
    private BigDecimal balance;
    private Long userId;

    private LocalDateTime updatedAt;
}