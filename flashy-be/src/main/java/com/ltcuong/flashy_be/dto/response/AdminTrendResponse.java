package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminTrendResponse {
    private List<MonthlyDataPoint> userGrowth;
    private List<MonthlyDataPoint> setGrowth;
    private List<MonthlyDataPoint> quizGrowth;
}
