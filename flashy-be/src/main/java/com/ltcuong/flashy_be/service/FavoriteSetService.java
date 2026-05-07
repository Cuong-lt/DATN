package com.ltcuong.flashy_be.service;

import com.ltcuong.flashy_be.dto.response.FlashcardSetResponse;

import java.util.List;

public interface FavoriteSetService {
    void toggleFavorite(Long setId);
    boolean isFavorite(Long setId);
    List<FlashcardSetResponse> getMyFavorites();
}
