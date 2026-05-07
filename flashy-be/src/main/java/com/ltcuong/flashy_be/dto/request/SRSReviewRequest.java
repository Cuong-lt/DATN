package com.ltcuong.flashy_be.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SRSReviewRequest {

    @NotNull
    private Long flashcardId;

    /**
     * Chất lượng trả lời theo SM-2:
     * 0 = Again (không nhớ gì)
     * 1 = Hard  (nhớ nhưng khó)
     * 3 = Good  (nhớ tốt)
     * 5 = Easy  (nhớ rất dễ)
     */
    @NotNull
    @Min(0) @Max(5)
    private Integer quality;
}
