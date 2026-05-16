package com.ltcuong.flashy_be.service;

import com.ltcuong.flashy_be.dto.request.AiGenerateRequest;
import com.ltcuong.flashy_be.dto.response.GeneratedFlashcardItem;

import java.util.List;

public interface AiFlashcardService {
    List<GeneratedFlashcardItem> generateFlashcards(AiGenerateRequest request);
}
