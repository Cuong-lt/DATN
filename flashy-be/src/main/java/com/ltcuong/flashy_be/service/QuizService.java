package com.ltcuong.flashy_be.service;

import com.ltcuong.flashy_be.dto.request.QuizRequest;
import com.ltcuong.flashy_be.dto.response.QuizResponse;

import java.util.List;

public interface QuizService {
    QuizResponse submitQuiz(Long setId, QuizRequest request);
    List<QuizResponse> getMyQuizzes();
    List<QuizResponse> getQuizzesBySet(Long setId);
    QuizResponse getQuizById(Long id);
    void deleteQuiz(Long id);
}