package com.cryptox.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LoginResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String role;

    private String token;

}