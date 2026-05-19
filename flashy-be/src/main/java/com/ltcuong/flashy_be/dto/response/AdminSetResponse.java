package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminSetResponse {
    private Long id;
    private String title;
    private String description;
    private String visibility;
    private LocalDateTime createdAt;
    private String ownerUsername;
    private Long ownerId;
    private int cardCount;
    private int favoriteCount;
}
