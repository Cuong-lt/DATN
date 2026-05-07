package com.ltcuong.flashy_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalSets;
    private long totalFlashcards;
    private long totalQuizzes;
    private long totalFolders;
    private long newUsersThisMonth;
    private long newSetsThisMonth;
    private long newQuizzesThisMonth;
}
