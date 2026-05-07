package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SRSStatsResponse {
    private Long setId;
    private String setTitle;
    private int totalCards;
    private int dueCards;      // số thẻ cần ôn hôm nay
    private int learnedCards;  // số thẻ đã học và chưa đến hạn
    private int newCards;      // số thẻ chưa học lần nào
}
