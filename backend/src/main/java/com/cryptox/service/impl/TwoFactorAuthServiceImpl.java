package com.cryptox.service.impl;

import com.cryptox.dto.response.TwoFactorSetupResponse;
import com.cryptox.service.TwoFactorAuthService;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.util.Utils;
import org.springframework.stereotype.Service;

@Service
public class TwoFactorAuthServiceImpl implements TwoFactorAuthService {

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final QrGenerator qrGenerator = new ZxingPngQrGenerator();

    @Override
    public TwoFactorSetupResponse generateSetup(String email) {

        String secret = secretGenerator.generate();

        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer("CryptoX Exchange")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        String qrCodeBase64;

        try {
            byte[] imageData = qrGenerator.generate(data);
            qrCodeBase64 = Utils.getDataUriForImage(
                    imageData,
                    qrGenerator.getImageMimeType()
            );
        } catch (QrGenerationException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }

        return TwoFactorSetupResponse.builder()
                .secret(secret)
                .qrCodeImageBase64(qrCodeBase64)
                .build();
    }

    @Override
    public boolean verifyCode(String secret, String code) {

        CodeVerifier verifier = new DefaultCodeVerifier(
                new DefaultCodeGenerator(),
                new SystemTimeProvider()
        );

        return verifier.isValidCode(secret, code);
    }
}