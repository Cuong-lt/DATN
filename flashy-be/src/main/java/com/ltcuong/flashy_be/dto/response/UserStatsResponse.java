package com.ltcuong.flashy_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {
    private long totalSets;
    private long totalFolders;
    private long totalCards;
    private long totalQuizzes;
    private long perfectQuizzes;
    private int bestQuizScore;
    private int bestQuizTotal;
    private long totalCorrectAnswers;
    private long totalQuestions;
    private int currentStreak;
    private int longestStreak;
    private long totalReviews;
    private LocalDateTime memberSince;
}
