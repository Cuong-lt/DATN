package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FlashcardResponse {
    private Long id;
    private String term;
    private String definition;
    private LocalDateTime createdAt;
    private Long setId;
}