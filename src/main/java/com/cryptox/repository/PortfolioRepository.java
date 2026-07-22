package com.cryptox.repository;

import com.cryptox.entity.Coin;
import com.cryptox.entity.Portfolio;
import com.cryptox.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    List<Portfolio> findByUser(User user);

    Optional<Portfolio> findByUserAndCoin(User user, Coin coin);

}
