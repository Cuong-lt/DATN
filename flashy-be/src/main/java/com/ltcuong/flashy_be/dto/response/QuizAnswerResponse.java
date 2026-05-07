package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuizAnswerResponse {

    private Long id;
    private Long flashcardId;
    private String term;
    private String correctAnswer;
    private String userAnswer;
    private Boolean isCorrect;
}