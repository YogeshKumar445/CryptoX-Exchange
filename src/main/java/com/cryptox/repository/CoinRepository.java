package com.cryptox.repository;

import com.cryptox.entity.Coin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CoinRepository extends JpaRepository<Coin, Long> {

    Optional<Coin> findBySymbol(String symbol);

    boolean existsBySymbol(String symbol);

}