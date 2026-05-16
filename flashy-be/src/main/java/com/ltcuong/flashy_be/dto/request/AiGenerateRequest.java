package com.ltcuong.flashy_be.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiGenerateRequest {
    @NotBlank(message = "Text or topic is required")
    private String text;

    @Min(1)
    @Max(20)
    private int cardCount = 10;
}
