package com.cryptox.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BuyCoinRequest {

    @NotNull(message = "Coin ID is required")
    private Long coinId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be greater than 0")
    private Double quantity;

}