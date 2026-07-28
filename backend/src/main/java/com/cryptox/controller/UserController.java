package com.cryptox.controller;

import com.cryptox.dto.request.UpdateProfileRequest;
import com.cryptox.dto.response.ApiResponse;
import com.cryptox.dto.response.UserResponse;
import com.cryptox.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> getCurrentUser(
            Authentication authentication
    ) {

        UserResponse user =
                userService.getCurrentUserProfile(
                        authentication.getName()
                );

        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User profile fetched successfully")
                .data(user)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @PutMapping("/me")
    public ApiResponse<UserResponse> updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {

        UserResponse updatedUser =
                userService.updateCurrentUserProfile(
                        authentication.getName(),
                        request
                );

        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Profile updated successfully")
                .data(updatedUser)
                .timestamp(LocalDateTime.now())
                .build();
    }
}