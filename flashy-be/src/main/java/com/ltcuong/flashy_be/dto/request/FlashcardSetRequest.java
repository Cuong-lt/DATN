package com.ltcuong.flashy_be.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class FlashcardSetRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String visibility = "private";

    private Long folderId;

    @Valid
    private List<FlashcardRequest> flashcards;
}