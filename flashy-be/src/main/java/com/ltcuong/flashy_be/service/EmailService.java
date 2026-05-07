package com.ltcuong.flashy_be.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Flashy - Password Reset OTP");
        message.setText("Your OTP code to reset your password is: " + otp
                + "\n\nThis code will expire in 5 minutes."
                + "\n\nIf you did not request this, please ignore this email.");
        mailSender.send(message);
    }
}
