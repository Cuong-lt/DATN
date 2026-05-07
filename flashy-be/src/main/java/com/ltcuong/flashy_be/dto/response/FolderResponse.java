package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class FolderResponse {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
    private List<FlashcardSetResponse> sets;
}