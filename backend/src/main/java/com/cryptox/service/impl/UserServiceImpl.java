package com.cryptox.service.impl;

import com.cryptox.dto.request.UpdateProfileRequest;
import com.cryptox.dto.response.UserResponse;
import com.cryptox.entity.User;
import com.cryptox.exception.ResourceNotFoundException;
import com.cryptox.repository.UserRepository;
import com.cryptox.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUserProfile(
            String currentEmail,
            UpdateProfileRequest request
    ) {

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        String firstName = request.getFirstName().trim();
        String lastName = request.getLastName().trim();
        String newEmail = request.getEmail().trim().toLowerCase();
        String newPhone = request.getPhone().trim();

        if (!user.getEmail().equalsIgnoreCase(newEmail)
                && userRepository.existsByEmail(newEmail)) {

            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        if (!user.getPhone().equals(newPhone)
                && userRepository.existsByPhone(newPhone)) {

            throw new IllegalArgumentException(
                    "Phone number is already registered"
            );
        }

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(newEmail);
        user.setPhone(newPhone);

        User updatedUser = userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    private UserResponse mapToResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}