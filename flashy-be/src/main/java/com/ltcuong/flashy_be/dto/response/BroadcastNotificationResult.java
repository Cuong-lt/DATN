package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BroadcastNotificationResult {
    private int sentCount;
    private int failedCount;
    private int totalTargeted;
}
