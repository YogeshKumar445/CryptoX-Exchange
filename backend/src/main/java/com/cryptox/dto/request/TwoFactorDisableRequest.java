package com.cryptox.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TwoFactorDisableRequest {

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Code is required")
    private String code;
}