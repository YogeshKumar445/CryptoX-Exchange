package com.cryptox.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ApiResponse {

    private boolean success;

    private String message;

    private Object data;

    private LocalDateTime timestamp;
}