package com.cryptox.service;

import com.cryptox.dto.request.LoginRequest;
import com.cryptox.dto.request.RegisterRequest;
import com.cryptox.dto.response.ApiResponse;

public interface AuthService {

    ApiResponse register(RegisterRequest request);

    ApiResponse login(LoginRequest request);

}