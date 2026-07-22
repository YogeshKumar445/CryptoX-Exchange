package com.cryptox.service.impl;

import com.cryptox.dto.request.BuyCoinRequest;
import com.cryptox.dto.response.PortfolioResponse;
import com.cryptox.entity.*;
import com.cryptox.enums.TransactionType;
import com.cryptox.exception.ResourceNotFoundException;
import com.cryptox.repository.CoinRepository;
import com.cryptox.repository.PortfolioRepository;
import com.cryptox.repository.TransactionRepository;
import com.cryptox.repository.WalletRepository;
import com.cryptox.service.AuthenticationService;
import com.cryptox.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final AuthenticationService authenticationService;
    private final CoinRepository coinRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public List<PortfolioResponse> getMyPortfolio() {

        User currentUser = authenticationService.getCurrentUser();

        List<Portfolio> portfolios = portfolioRepository.findByUser(currentUser);

        return portfolios.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PortfolioResponse mapToResponse(Portfolio portfolio) {

        double totalInvestment =
                portfolio.getQuantity() * portfolio.getAverageBuyPrice();

        double currentValue =
                portfolio.getQuantity() * portfolio.getCoin().getCurrentPrice();

        double profitOrLoss =
                currentValue - totalInvestment;

        return PortfolioResponse.builder()
                .coinId(portfolio.getCoin().getId())
                .symbol(portfolio.getCoin().getSymbol())
                .coinName(portfolio.getCoin().getName())
                .imageUrl(portfolio.getCoin().getImageUrl())
                .quantity(portfolio.getQuantity())
                .averageBuyPrice(portfolio.getAverageBuyPrice())
                .currentPrice(portfolio.getCoin().getCurrentPrice())
                .totalInvestment(totalInvestment)
                .currentValue(currentValue)
                .profitOrLoss(profitOrLoss)
                .build();
    }

    @Override
    @Transactional
    public void buyCoin(BuyCoinRequest request) {

        User currentUser = authenticationService.getCurrentUser();

        Coin coin = coinRepository.findById(request.getCoinId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Coin not found"));

        Wallet wallet = walletRepository.findByUserId(currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Wallet not found"));

        BigDecimal totalCost = BigDecimal.valueOf(
                request.getQuantity() * coin.getCurrentPrice()
        );

        if (wallet.getBalance().compareTo(totalCost) < 0) {
            throw new IllegalArgumentException("Insufficient wallet balance");
        }
        wallet.setBalance(wallet.getBalance().subtract(totalCost));

        walletRepository.save(wallet);

        Portfolio portfolio = portfolioRepository
                .findByUserAndCoin(currentUser, coin)
                .orElse(null);

        if (portfolio != null) {

            double oldQuantity = portfolio.getQuantity();
            double oldAveragePrice = portfolio.getAverageBuyPrice();

            double newQuantity = request.getQuantity();
            double currentPrice = coin.getCurrentPrice();

            double totalQuantity = oldQuantity + newQuantity;

            double newAveragePrice =
                    ((oldQuantity * oldAveragePrice)
                            + (newQuantity * currentPrice))
                            / totalQuantity;

            portfolio.setQuantity(totalQuantity);
            portfolio.setAverageBuyPrice(newAveragePrice);

        } else {

            portfolio = Portfolio.builder()
                    .user(currentUser)
                    .coin(coin)
                    .quantity(request.getQuantity())
                    .averageBuyPrice(coin.getCurrentPrice())
                    .build();

        }

        portfolioRepository.save(portfolio);

        Transaction transaction = Transaction.builder()
                .user(currentUser)
                .coin(coin)
                .quantity(request.getQuantity())
                .price(BigDecimal.valueOf(coin.getCurrentPrice()))
                .amount(totalCost)
                .type(TransactionType.BUY)
                .build();

        transactionRepository.save(transaction);
    }
}