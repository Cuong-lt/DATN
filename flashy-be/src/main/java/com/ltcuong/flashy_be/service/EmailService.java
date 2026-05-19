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

    public void sendSetDeletedNotification(String to, String username, String setTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[Flashy] Bộ thẻ của bạn đã bị xóa");
        message.setText(
            "Xin chào " + username + ",\n\n"
            + "Bộ thẻ \"" + setTitle + "\" của bạn đã bị xóa bởi quản trị viên do vi phạm điều khoản sử dụng.\n\n"
            + "Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ với chúng tôi.\n\n"
            + "Trân trọng,\nĐội ngũ Flashy"
        );
        mailSender.send(message);
    }

    public void sendBroadcastEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[Flashy] " + subject);
        message.setText(body + "\n\n---\nThông báo từ hệ thống Flashy. Vui lòng không trả lời email này.");
        mailSender.send(message);
    }
}
