package com.ltcuong.flashy_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DailyActivityResponse {
    private String date;
    private int count;     // số quiz trong ngày
}
