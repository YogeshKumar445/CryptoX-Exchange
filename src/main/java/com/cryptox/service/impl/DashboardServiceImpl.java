package com.cryptox.service.impl;

import com.cryptox.dto.response.DashboardResponse;
import com.cryptox.entity.User;
import com.cryptox.entity.Wallet;
import com.cryptox.exception.ResourceNotFoundException;
import com.cryptox.repository.PortfolioRepository;
import com.cryptox.repository.TransactionRepository;
import com.cryptox.repository.WalletRepository;
import com.cryptox.service.AuthenticationService;
import com.cryptox.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.cryptox.entity.Portfolio;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final AuthenticationService authenticationService;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PortfolioRepository portfolioRepository;


    @Transactional(readOnly = true)
    @Override
    public DashboardResponse getDashboard() {

        User currentUser = authenticationService.getCurrentUser();

        Wallet wallet = walletRepository.findByUserId(currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Wallet not found"));

        List<Portfolio> portfolios =
                portfolioRepository.findByUser(currentUser);

        double portfolioValue = 0;
        double totalInvestment = 0;

        for (Portfolio portfolio : portfolios) {

            double currentValue =
                    portfolio.getQuantity()
                            * portfolio.getCoin().getCurrentPrice();

            portfolioValue += currentValue;

            double investment =
                    portfolio.getQuantity()
                            * portfolio.getAverageBuyPrice();

            totalInvestment += investment;
        }

        double totalProfitLoss =
                portfolioValue - totalInvestment;

        int coinsOwned = portfolios.size();

        long totalTransactions =
                transactionRepository.countByUserId(currentUser.getId());

        return DashboardResponse.builder()
                .walletBalance(wallet.getBalance().doubleValue())
                .portfolioValue(portfolioValue)
                .totalInvestment(totalInvestment)
                .totalProfitLoss(totalProfitLoss)
                .coinsOwned(coinsOwned)
                .totalTransactions(totalTransactions)
                .build();
    }
}
