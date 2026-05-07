package com.ltcuong.flashy_be.controller;

import com.ltcuong.flashy_be.dto.response.ApiResponse;
import com.ltcuong.flashy_be.dto.response.FlashcardSetResponse;
import com.ltcuong.flashy_be.service.FavoriteSetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteSetController {

    private final FavoriteSetService favoriteSetService;

    @PostMapping("/{setId}")
    public ResponseEntity<ApiResponse<Boolean>> toggleFavorite(@PathVariable Long setId) {
        favoriteSetService.toggleFavorite(setId);
        boolean isFav = favoriteSetService.isFavorite(setId);
        return ResponseEntity.ok(
                ApiResponse.<Boolean>builder()
                        .code(200)
                        .message(isFav ? "Added to favorites" : "Removed from favorites")
                        .data(isFav)
                        .build()
        );
    }

    @GetMapping("/check/{setId}")
    public ResponseEntity<ApiResponse<Boolean>> isFavorite(@PathVariable Long setId) {
        return ResponseEntity.ok(
                ApiResponse.<Boolean>builder()
                        .code(200)
                        .message("Checked")
                        .data(favoriteSetService.isFavorite(setId))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FlashcardSetResponse>>> getMyFavorites() {
        return ResponseEntity.ok(
                ApiResponse.<List<FlashcardSetResponse>>builder()
                        .code(200)
                        .message("Favorites retrieved successfully")
                        .data(favoriteSetService.getMyFavorites())
                        .build()
        );
    }
}
