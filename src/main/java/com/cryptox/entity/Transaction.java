package com.cryptox.entity;

import com.cryptox.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;



    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coin_id")
    private Coin coin;

    @Column
    private Double quantity;

    @Column(precision = 19, scale = 8)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;



    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}