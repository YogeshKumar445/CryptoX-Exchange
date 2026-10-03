package com.cryptox.service;

import com.cryptox.dto.response.TwoFactorSetupResponse;

public interface TwoFactorAuthService {

    TwoFactorSetupResponse generateSetup(String email);

    boolean verifyCode(String secret, String code);
}