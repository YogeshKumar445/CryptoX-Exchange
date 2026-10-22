package com.cryptox.service;

import com.cryptox.entity.User;
import com.cryptox.exception.AccountLockedException;
import com.cryptox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpVerificationService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;

    private final UserRepository userRepository;
    private final TwoFactorAuthService twoFactorAuthService;

    /**
     * Withdrawal se pehle sabse pehle yeh check hoga, taaki user ko
     * PIN daalne ke baad pata na chale ki 2FA to enabled hi nahi tha.
     */
    @Transactional(readOnly = true)
    public void ensureTwoFactorEnabled(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (!Boolean.TRUE.equals(user.getTwoFactorEnabled())
                || user.getTwoFactorSecret() == null) {
            throw new IllegalArgumentException(
                    "Two-factor authentication must be enabled to withdraw funds. "
                            + "Please enable it from your Profile page first."
            );
        }
    }

    /**
     * noRollbackFor zaroori hai: galat code par exception aayegi,
     * par "attempt +1" aur "lock" DB mein save rehna chahiye.
     */
    @Transactional(noRollbackFor = {
            IllegalArgumentException.class,
            AccountLockedException.class
    })
    public void verifyOtp(String email, String code) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (!Boolean.TRUE.equals(user.getTwoFactorEnabled())
                || user.getTwoFactorSecret() == null) {
            throw new IllegalArgumentException(
                    "Two-factor authentication must be enabled to withdraw funds. "
                            + "Please enable it from your Profile page first."
            );
        }

        LocalDateTime now = LocalDateTime.now();

        if (user.getOtpLockedUntil() != null) {

            if (user.getOtpLockedUntil().isAfter(now)) {

                long minutesLeft = Math.max(
                        1,
                        Duration.between(now, user.getOtpLockedUntil()).toMinutes() + 1
                );

                throw new AccountLockedException(
                        "Authenticator code is locked. Try again in "
                                + minutesLeft + " minute(s)."
                );
            }

            // Lock ka time khatam ho gaya, fresh start
            user.setOtpLockedUntil(null);
            user.setOtpFailedAttempts(0);
            userRepository.save(user);
        }

        boolean valid = twoFactorAuthService.verifyCode(
                user.getTwoFactorSecret(),
                code
        );

        if (!valid) {

            int attempts = user.getOtpFailedAttempts() + 1;

            if (attempts >= MAX_FAILED_ATTEMPTS) {

                user.setOtpFailedAttempts(0);
                user.setOtpLockedUntil(now.plusMinutes(LOCK_MINUTES));
                userRepository.save(user);

                throw new AccountLockedException(
                        "Too many incorrect authenticator codes. Withdrawals locked for "
                                + LOCK_MINUTES + " minutes."
                );
            }

            user.setOtpFailedAttempts(attempts);
            userRepository.save(user);

            int remaining = MAX_FAILED_ATTEMPTS - attempts;

            throw new IllegalArgumentException(
                    "Incorrect authenticator code. " + remaining + " attempt(s) remaining."
            );
        }

        if (user.getOtpFailedAttempts() > 0) {
            user.setOtpFailedAttempts(0);
            userRepository.save(user);
        }
    }
}