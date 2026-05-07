package com.ltcuong.flashy_be.controller;

import com.ltcuong.flashy_be.dto.request.QuizRequest;
import com.ltcuong.flashy_be.dto.response.ApiResponse;
import com.ltcuong.flashy_be.dto.response.QuizResponse;
import com.ltcuong.flashy_be.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/api/sets/{setId}/quizzes")
    public ResponseEntity<ApiResponse<QuizResponse>> submitQuiz(
            @PathVariable Long setId,
            @Valid @RequestBody QuizRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<QuizResponse>builder()
                        .code(201)
                        .message("Quiz submitted successfully")
                        .data(quizService.submitQuiz(setId, request))
                        .build()
        );
    }

    @GetMapping("/api/quizzes")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getMyQuizzes() {
        return ResponseEntity.ok(
                ApiResponse.<List<QuizResponse>>builder()
                        .code(200)
                        .message("Quizzes retrieved successfully")
                        .data(quizService.getMyQuizzes())
                        .build()
        );
    }

    @GetMapping("/api/sets/{setId}/quizzes")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getQuizzesBySet(@PathVariable Long setId) {
        return ResponseEntity.ok(
                ApiResponse.<List<QuizResponse>>builder()
                        .code(200)
                        .message("Quizzes retrieved successfully")
                        .data(quizService.getQuizzesBySet(setId))
                        .build()
        );
    }

    @GetMapping("/api/quizzes/{id}")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<QuizResponse>builder()
                        .code(200)
                        .message("Quiz retrieved successfully")
                        .data(quizService.getQuizById(id))
                        .build()
        );
    }

    @DeleteMapping("/api/quizzes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Quiz deleted successfully")
                        .build()
        );
    }
}