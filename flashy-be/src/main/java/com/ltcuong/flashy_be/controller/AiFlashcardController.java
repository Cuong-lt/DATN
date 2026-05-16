package com.ltcuong.flashy_be.controller;

import com.ltcuong.flashy_be.dto.request.AiGenerateRequest;
import com.ltcuong.flashy_be.dto.response.ApiResponse;
import com.ltcuong.flashy_be.dto.response.GeneratedFlashcardItem;
import com.ltcuong.flashy_be.service.AiFlashcardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiFlashcardController {

    private final AiFlashcardService aiFlashcardService;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;

    @GetMapping("/models")
    public ResponseEntity<String> listModels() {
        String url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
        String result = restTemplate.getForObject(url, String.class);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<GeneratedFlashcardItem>>> generateFlashcards(
            @RequestBody @Valid AiGenerateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<List<GeneratedFlashcardItem>>builder()
                        .code(200)
                        .message("Flashcards generated successfully")
                        .data(aiFlashcardService.generateFlashcards(request))
                        .build()
        );
    }
}
