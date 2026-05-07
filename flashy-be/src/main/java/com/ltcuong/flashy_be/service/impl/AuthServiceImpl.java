package com.ltcuong.flashy_be.service.impl;

import com.ltcuong.flashy_be.config.JwtService;
import com.ltcuong.flashy_be.dto.request.*;
import com.ltcuong.flashy_be.dto.response.AuthResponse;
import com.ltcuong.flashy_be.entity.InvalidatedToken;
import com.ltcuong.flashy_be.entity.PasswordResetOtp;
import com.ltcuong.flashy_be.entity.User;
import com.ltcuong.flashy_be.exception.AppException;
import com.ltcuong.flashy_be.exception.ErrorCode;
import com.ltcuong.flashy_be.repository.InvalidatedTokenRepository;
import com.ltcuong.flashy_be.repository.PasswordResetOtpRepository;
import com.ltcuong.flashy_be.repository.UserRepository;
import com.ltcuong.flashy_be.service.AuthService;
import com.ltcuong.flashy_be.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final EmailService emailService;

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    @Override
    public void logout(String token) {
        String jti = jwtService.extractJti(token);
        java.util.Date expiryTime = jwtService.extractExpiration(token);

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jti)
                .expiryTime(expiryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

        String otp = generateOtp();

        PasswordResetOtp otpEntity = PasswordResetOtp.builder()
                .email(request.getEmail())
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();

        passwordResetOtpRepository.save(otpEntity);
        emailService.sendOtpEmail(request.getEmail(), otp);
    }

    @Override
    public void verifyOtp(VerifyOtpRequest request) {
        PasswordResetOtp otpEntity = passwordResetOtpRepository
                .findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.OTP_INVALID));

        if (otpEntity.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        if (!otpEntity.getOtp().equals(request.getOtp())) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetOtp otpEntity = passwordResetOtpRepository
                .findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.OTP_INVALID));

        if (otpEntity.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        if (!otpEntity.getOtp().equals(request.getOtp())) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpEntity.setUsed(true);
        passwordResetOtpRepository.save(otpEntity);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}