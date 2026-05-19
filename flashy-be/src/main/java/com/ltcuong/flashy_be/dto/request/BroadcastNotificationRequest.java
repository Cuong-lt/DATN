package com.ltcuong.flashy_be.dto.request;

import lombok.Data;

@Data
public class BroadcastNotificationRequest {
    private String subject;
    private String message;
    private String targetRole; // "ALL", "USER", "ADMIN"
}
