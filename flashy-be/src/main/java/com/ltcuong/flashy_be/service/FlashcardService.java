package com.ltcuong.flashy_be.service;

import com.ltcuong.flashy_be.dto.request.FlashcardRequest;
import com.ltcuong.flashy_be.dto.response.FlashcardResponse;

import java.util.List;

public interface FlashcardService {
    List<FlashcardResponse> getFlashcardsBySet(Long setId);
    FlashcardResponse createFlashcard(Long setId, FlashcardRequest request);
    FlashcardResponse updateFlashcard(Long id, FlashcardRequest request);
    void deleteFlashcard(Long id);
}