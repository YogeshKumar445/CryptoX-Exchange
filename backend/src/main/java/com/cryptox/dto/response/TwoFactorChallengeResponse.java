package com.cryptox.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorChallengeResponse {

    private String tempToken;

    @Builder.Default
    private boolean twoFactorRequired = true;
}