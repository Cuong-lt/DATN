package com.ltcuong.flashy_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FlashcardRequest {

    @NotBlank(message = "Term is required")
    private String term;

    @NotBlank(message = "Definition is required")
    private String definition;
}