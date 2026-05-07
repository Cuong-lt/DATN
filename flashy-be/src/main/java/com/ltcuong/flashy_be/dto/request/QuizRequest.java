package com.ltcuong.flashy_be.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class QuizRequest {

    @NotNull(message = "Answers list is required")
    @NotEmpty(message = "Answers list must not be empty")
    private List<@Valid QuizAnswerRequest> answers;
}