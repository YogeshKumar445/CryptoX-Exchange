package com.cryptox.dto.response;

import com.cryptox.enums.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long id;

    private Long coinId;

    private String coinName;

    private String symbol;

    private String imageUrl;

    private Double quantity;

    private BigDecimal price;

    private BigDecimal amount;

    private TransactionType type;

    private LocalDateTime createdAt;

}