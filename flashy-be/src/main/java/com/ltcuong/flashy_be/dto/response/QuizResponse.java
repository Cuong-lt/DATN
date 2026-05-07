package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class QuizResponse {

    private Long id;
    private Long setId;
    private String setTitle;
    private Integer score;
    private Integer totalQuestion;
    private LocalDateTime createdAt;
    private List<QuizAnswerResponse> answers;
}