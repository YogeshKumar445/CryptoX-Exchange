package com.cryptox.repository;

import com.cryptox.entity.Coin;
import com.cryptox.entity.User;
import com.cryptox.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository
        extends JpaRepository<Watchlist, Long> {

    List<Watchlist> findByUser(User user);

    Optional<Watchlist> findByUserAndCoin(
            User user,
            Coin coin
    );

    boolean existsByUserAndCoin(
            User user,
            Coin coin
    );

    void deleteByUserAndCoin(
            User user,
            Coin coin
    );
}