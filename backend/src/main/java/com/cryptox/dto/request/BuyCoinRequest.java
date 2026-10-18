package com.cryptox.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BuyCoinRequest {

    @NotNull(message = "Coin ID is required")
    private Long coinId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(
            value = "0.00000001",
            inclusive = true,
            message = "Quantity must be greater than zero"
    )
    private Double quantity;

    @NotBlank(message = "Transaction PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "PIN must be exactly 4 digits")
    private String pin;

}