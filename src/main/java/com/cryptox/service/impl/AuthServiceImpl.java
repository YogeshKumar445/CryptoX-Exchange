package com.cryptox.service.impl;

import com.cryptox.dto.request.LoginRequest;
import com.cryptox.dto.request.RegisterRequest;
import com.cryptox.dto.response.ApiResponse;
import com.cryptox.dto.response.LoginResponse;
import com.cryptox.entity.User;
import com.cryptox.enums.UserRole;
import com.cryptox.exception.ResourceAlreadyExistsException;
import com.cryptox.exception.ResourceNotFoundException;
import com.cryptox.repository.UserRepository;
import com.cryptox.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ApiResponse register(RegisterRequest request) {

        if(userRepository.existsByEmail(request.getEmail())){
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        if(userRepository.existsByPhone(request.getPhone())){
            throw new ResourceAlreadyExistsException("Phone number already exists");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .active(true)
                .build();

        userRepository.save(user);

        return ApiResponse.builder()
                .success(true)
                .message("User registered successfully")
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
    @Override
    public ApiResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invalid email or password"));

        System.out.println("========== LOGIN DEBUG ==========");
        System.out.println("Email From Request : " + request.getEmail());
        System.out.println("Password From Request : " + request.getPassword());
        System.out.println("Password From DB : " + user.getPassword());

        boolean matched = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );
        System.out.println("Password Matched : " + matched);
        System.out.println("================================");



        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResourceNotFoundException("Invalid email or password");
        }

        LoginResponse response = LoginResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();

        return ApiResponse.builder()
                .success(true)
                .message("Login successful")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }
}