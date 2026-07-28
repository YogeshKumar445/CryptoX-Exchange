package com.cryptox.service;

import com.cryptox.dto.request.UpdateProfileRequest;
import com.cryptox.dto.response.UserResponse;

public interface UserService {

    UserResponse getCurrentUserProfile(String email);

    UserResponse updateCurrentUserProfile(
            String currentEmail,
            UpdateProfileRequest request
    );
}