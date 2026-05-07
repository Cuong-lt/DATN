package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SRSCardResponse {
    private Long flashcardId;
    private String term;
    private String definition;
    private Integer repetition;
    private Double easeFactor;
    private Integer intervalDays;
    private LocalDateTime nextReview;
    private Integer reviewCount;
    private Integer correctCount;
}
