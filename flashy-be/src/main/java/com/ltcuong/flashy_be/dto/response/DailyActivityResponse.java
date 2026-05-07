package com.ltcuong.flashy_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DailyActivityResponse {
    private String date;   // "yyyy-MM-dd"
    private int count;     // số quiz trong ngày
}
