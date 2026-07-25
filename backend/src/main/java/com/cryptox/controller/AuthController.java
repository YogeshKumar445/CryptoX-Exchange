package com.cryptox.controller;

import com.cryptox.dto.request.LoginRequest;
import com.cryptox.dto.request.RegisterRequest;
import com.cryptox.dto.response.ApiResponse;
import com.cryptox.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse register(@Valid @RequestBody RegisterRequest request) {

        return authService.register(request);

    }
    @PostMapping("/login")
    public ApiResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

}
