package com.ltcuong.flashy_be.controller;

import com.ltcuong.flashy_be.dto.request.FlashcardRequest;
import com.ltcuong.flashy_be.dto.response.ApiResponse;
import com.ltcuong.flashy_be.dto.response.FlashcardResponse;
import com.ltcuong.flashy_be.service.FlashcardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardService flashcardService;

    @GetMapping("/sets/{setId}/flashcards")
    public ResponseEntity<ApiResponse<List<FlashcardResponse>>> getFlashcardsBySet(@PathVariable Long setId) {
        return ResponseEntity.ok(
                ApiResponse.<List<FlashcardResponse>>builder()
                        .code(200)
                        .message("Flashcards retrieved successfully")
                        .data(flashcardService.getFlashcardsBySet(setId))
                        .build()
        );
    }

    @PostMapping("/sets/{setId}/flashcards")
    public ResponseEntity<ApiResponse<FlashcardResponse>> createFlashcard(
            @PathVariable Long setId,
            @Valid @RequestBody FlashcardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<FlashcardResponse>builder()
                        .code(201)
                        .message("Flashcard created successfully")
                        .data(flashcardService.createFlashcard(setId, request))
                        .build()
        );
    }

    @PutMapping("/flashcards/{id}")
    public ResponseEntity<ApiResponse<FlashcardResponse>> updateFlashcard(
            @PathVariable Long id,
            @Valid @RequestBody FlashcardRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<FlashcardResponse>builder()
                        .code(200)
                        .message("Flashcard updated successfully")
                        .data(flashcardService.updateFlashcard(id, request))
                        .build()
        );
    }

    @DeleteMapping("/flashcards/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFlashcard(@PathVariable Long id) {
        flashcardService.deleteFlashcard(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Flashcard deleted successfully")
                        .build()
        );
    }
}