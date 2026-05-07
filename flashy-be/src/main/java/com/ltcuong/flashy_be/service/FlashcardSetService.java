package com.ltcuong.flashy_be.service;

import com.ltcuong.flashy_be.dto.request.FlashcardSetRequest;
import com.ltcuong.flashy_be.dto.response.FlashcardSetResponse;
import com.ltcuong.flashy_be.dto.response.PageResponse;

import java.util.List;

public interface FlashcardSetService {
    List<FlashcardSetResponse> getMySets();
    List<FlashcardSetResponse> getMySetsForExport();
    PageResponse<FlashcardSetResponse> getMySets(int page, int size);
    PageResponse<FlashcardSetResponse> searchPublicSets(String keyword, int page, int size);
    List<FlashcardSetResponse> getSetsByFolder(Long folderId);
    List<FlashcardSetResponse> searchSetsByFolder(Long folderId, String keyword);
    FlashcardSetResponse getSetById(Long id);
    FlashcardSetResponse createSet(FlashcardSetRequest request);
    FlashcardSetResponse updateSet(Long id, FlashcardSetRequest request);
    void deleteSet(Long id);
}