package com.cryptox.service;

import com.cryptox.entity.User;
import com.cryptox.exception.AccountLockedException;
import com.cryptox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TransactionPinService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * noRollbackFor zaroori hai: galat PIN par exception aayegi,
     * par "attempt +1" aur "lock" DB mein save rehna chahiye.
     */
    @Transactional(noRollbackFor = {
            IllegalArgumentException.class,
            AccountLockedException.class
    })
    public void verifyPin(String email, String pin) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (user.getTransactionPinHash() == null) {
            throw new IllegalArgumentException(
                    "Transaction PIN is not set. Please set your PIN from the Profile page first."
            );
        }

        LocalDateTime now = LocalDateTime.now();

        if (user.getPinLockedUntil() != null) {

            if (user.getPinLockedUntil().isAfter(now)) {

                long minutesLeft = Math.max(
                        1,
                        Duration.between(now, user.getPinLockedUntil()).toMinutes() + 1
                );

                throw new AccountLockedException(
                        "Transaction PIN is locked. Try again in "
                                + minutesLeft + " minute(s)."
                );
            }

            // Lock ka time khatam ho gaya, fresh start
            user.setPinLockedUntil(null);
            user.setPinFailedAttempts(0);
            userRepository.save(user);
        }

        if (!passwordEncoder.matches(pin, user.getTransactionPinHash())) {

            int attempts = user.getPinFailedAttempts() + 1;

            if (attempts >= MAX_FAILED_ATTEMPTS) {

                user.setPinFailedAttempts(0);
                user.setPinLockedUntil(now.plusMinutes(LOCK_MINUTES));
                userRepository.save(user);

                throw new AccountLockedException(
                        "Too many incorrect PIN attempts. Transaction PIN locked for "
                                + LOCK_MINUTES + " minutes."
                );
            }

            user.setPinFailedAttempts(attempts);
            userRepository.save(user);

            int remaining = MAX_FAILED_ATTEMPTS - attempts;

            throw new IllegalArgumentException(
                    "Incorrect PIN. " + remaining + " attempt(s) remaining."
            );
        }

        if (user.getPinFailedAttempts() > 0) {
            user.setPinFailedAttempts(0);
            userRepository.save(user);
        }
    }
}