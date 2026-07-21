package com.cryptox.dto.response;

import com.cryptox.enums.TransactionType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {

    private Long id;

    private BigDecimal amount;

    private TransactionType type;

    private LocalDateTime createdAt;

}