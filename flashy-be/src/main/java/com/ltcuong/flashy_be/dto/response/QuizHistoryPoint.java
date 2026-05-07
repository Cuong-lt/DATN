package com.ltcuong.flashy_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuizHistoryPoint {
    private String date;       // "yyyy-MM-dd"
    private String setTitle;
    private int score;
    private int total;
    private int accuracy;      // 0-100
}
