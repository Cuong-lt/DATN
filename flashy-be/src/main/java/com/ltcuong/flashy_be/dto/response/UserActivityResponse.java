package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class UserActivityResponse {
    // Tổng quan
    private long totalCards;
    private long totalSets;
    private long totalQuizzes;
    private int  currentStreak;
    private int  longestStreak;
    private int  overallAccuracy;      // 0-100

    // Biểu đồ hoạt động 30 ngày gần nhất
    private List<DailyActivityResponse> dailyActivity;

    // Lịch sử quiz gần nhất (20 lần)
    private List<QuizHistoryPoint> recentQuizzes;

    // SRS tổng hợp toàn bộ set
    private int srsTotal;
    private int srsDue;
    private int srsLearned;
    private int srsNew;
}
