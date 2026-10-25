package com.cryptox.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DepositRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    @DecimalMax(value = "1000000.00", message = "A single deposit cannot exceed $1,000,000")
    @Digits(integer = 7, fraction = 2, message = "Amount can have at most 2 decimal places")
    private BigDecimal amount;
}