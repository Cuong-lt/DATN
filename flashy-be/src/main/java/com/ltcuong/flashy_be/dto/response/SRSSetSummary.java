package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SRSSetSummary {
    private Long setId;
    private String setTitle;
    private int totalCards;
    private int dueCards;
    private int learnedCards;
    private int newCards;
}
