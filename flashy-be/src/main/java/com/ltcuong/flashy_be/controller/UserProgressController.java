package com.ltcuong.flashy_be.controller;

import com.ltcuong.flashy_be.dto.request.SRSReviewRequest;
import com.ltcuong.flashy_be.dto.response.ApiResponse;
import com.ltcuong.flashy_be.dto.response.SRSCardResponse;
import com.ltcuong.flashy_be.dto.response.SRSSetSummary;
import com.ltcuong.flashy_be.dto.response.SRSStatsResponse;
import com.ltcuong.flashy_be.service.UserProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserProgressController {

    private final UserProgressService userProgressService;

    @GetMapping("/api/sets/{setId}/srs/due")
    public ResponseEntity<ApiResponse<List<SRSCardResponse>>> getDueCards(@PathVariable Long setId) {
        return ResponseEntity.ok(
                ApiResponse.<List<SRSCardResponse>>builder()
                        .code(200)
                        .message("Due cards retrieved successfully")
                        .data(userProgressService.getDueCards(setId))
                        .build()
        );
    }

    @PostMapping("/api/sets/{setId}/srs/review")
    public ResponseEntity<ApiResponse<SRSCardResponse>> reviewCard(
            @PathVariable Long setId,
            @Valid @RequestBody SRSReviewRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<SRSCardResponse>builder()
                        .code(200)
                        .message("Card reviewed successfully")
                        .data(userProgressService.reviewCard(setId, request))
                        .build()
        );
    }

    @GetMapping("/api/sets/{setId}/srs/stats")
    public ResponseEntity<ApiResponse<SRSStatsResponse>> getStats(@PathVariable Long setId) {
        return ResponseEntity.ok(
                ApiResponse.<SRSStatsResponse>builder()
                        .code(200)
                        .message("SRS stats retrieved successfully")
                        .data(userProgressService.getStats(setId))
                        .build()
        );
    }

    @GetMapping("/api/srs/overview")
    public ResponseEntity<ApiResponse<List<SRSSetSummary>>> getOverview() {
        return ResponseEntity.ok(
                ApiResponse.<List<SRSSetSummary>>builder()
                        .code(200)
                        .message("SRS overview retrieved successfully")
                        .data(userProgressService.getOverview())
                        .build()
        );
    }
}
