package com.ltcuong.flashy_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizAnswerRequest {

    @NotNull(message = "Flashcard ID is required")
    private Long flashcardId;

    @NotBlank(message = "User answer is required")
    private String userAnswer;
}