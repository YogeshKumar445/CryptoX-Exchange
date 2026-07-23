package com.cryptox.repository;

import com.cryptox.entity.Coin;
import com.cryptox.entity.Portfolio;
import com.cryptox.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    @Query("""
            SELECT p
            FROM Portfolio p
            JOIN FETCH p.coin
            WHERE p.user = :user
            """)
    List<Portfolio> findByUser(@Param("user") User user);

    Optional<Portfolio> findByUserAndCoin(User user, Coin coin);

}