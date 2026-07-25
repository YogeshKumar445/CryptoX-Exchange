package com.cryptox.service.impl;

import com.cryptox.dto.response.ApiResponse;
import com.cryptox.dto.response.TransactionResponse;
import com.cryptox.entity.Coin;
import com.cryptox.entity.Transaction;
import com.cryptox.entity.User;
import com.cryptox.enums.TransactionType;
import com.cryptox.exception.ResourceNotFoundException;
import com.cryptox.repository.TransactionRepository;
import com.cryptox.repository.UserRepository;
import com.cryptox.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Override
    public Transaction saveTransaction(
            User user,
            BigDecimal amount,
            TransactionType type
    ) {
        System.out.println("Saving transaction: " + type + " " + amount);
        System.out.println(">>> Saving transaction: " + type + " " + amount);
        Transaction transaction = Transaction.builder()
                .user(user)
                .amount(amount)
                .type(type)
                .build();

        return transactionRepository.save(transaction);
    }



    @Override
    @Transactional(readOnly = true)
    public ApiResponse getMyTransactions(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        List<TransactionResponse> response =
                transactionRepository
                        .findByUserIdOrderByCreatedAtDesc(user.getId())
                        .stream()
                        .map(transaction -> {

                            Coin coin = transaction.getCoin();

                            return TransactionResponse.builder()
                                    .id(transaction.getId())
                                    .coinId(coin != null ? coin.getId() : null)
                                    .coinName(coin != null ? coin.getName() : null)
                                    .symbol(coin != null ? coin.getSymbol() : null)
                                    .imageUrl(coin != null ? coin.getImageUrl() : null)
                                    .quantity(transaction.getQuantity())
                                    .price(transaction.getPrice())
                                    .amount(transaction.getAmount())
                                    .type(transaction.getType())
                                    .createdAt(transaction.getCreatedAt())
                                    .build();
                        })
                        .toList();

        return ApiResponse.builder()
                .success(true)
                .message("Transactions fetched successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
