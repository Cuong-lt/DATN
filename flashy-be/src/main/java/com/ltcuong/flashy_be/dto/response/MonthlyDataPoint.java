package com.ltcuong.flashy_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyDataPoint {
    private String month;
    private long count;
}
