package com.cryptox.service;

import com.cryptox.dto.response.ApiResponse;
import com.cryptox.entity.Transaction;
import com.cryptox.entity.User;
import com.cryptox.enums.TransactionType;

import java.math.BigDecimal;

public interface TransactionService {

    Transaction saveTransaction(
            User user,
            BigDecimal amount,
            TransactionType type
    );

    ApiResponse getMyTransactions(String email);
}
