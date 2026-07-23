package com.cryptox.repository;

import com.cryptox.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("""
           SELECT t
           FROM Transaction t
           LEFT JOIN FETCH t.coin
           WHERE t.user.id = :userId
           ORDER BY t.createdAt DESC
           """)
    List<Transaction> findByUserIdOrderByCreatedAtDesc(
            @Param("userId") Long userId
    );

}