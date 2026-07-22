package com.cryptox.scheduler;

import com.cryptox.service.CoinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CoinSyncScheduler {

    private final CoinService coinService;

    @Scheduled(fixedRate = 300000)
    public void syncCoins() {

        log.info("Starting automatic coin synchronization...");

        coinService.syncTopCoins();

        log.info("Coin synchronization completed successfully.");

    }
}