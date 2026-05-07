package com.ltcuong.flashy_be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class FlashcardSetResponse {
    private Long id;
    private String title;
    private String description;
    private String visibility;
    private LocalDateTime createdAt;
    private Long folderId;
    private String username;
    private int flashcardCount;
    private List<FlashcardResponse> flashcards;
}