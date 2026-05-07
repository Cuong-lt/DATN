package com.ltcuong.flashy_be.service.impl;

import com.ltcuong.flashy_be.dto.response.FlashcardSetResponse;
import com.ltcuong.flashy_be.entity.FavoriteSet;
import com.ltcuong.flashy_be.entity.FlashcardSet;
import com.ltcuong.flashy_be.entity.User;
import com.ltcuong.flashy_be.exception.AppException;
import com.ltcuong.flashy_be.exception.ErrorCode;
import com.ltcuong.flashy_be.repository.FavoriteSetRepository;
import com.ltcuong.flashy_be.repository.FlashcardSetRepository;
import com.ltcuong.flashy_be.repository.UserRepository;
import com.ltcuong.flashy_be.service.FavoriteSetService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteSetServiceImpl implements FavoriteSetService {

    private final FavoriteSetRepository favoriteSetRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public void toggleFavorite(Long setId) {
        User user = getCurrentUser();
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));

        Optional<FavoriteSet> existing = favoriteSetRepository.findByUserAndFlashcardSet(user, set);
        if (existing.isPresent()) {
            favoriteSetRepository.delete(existing.get());
        } else {
            FavoriteSet favorite = FavoriteSet.builder()
                    .user(user)
                    .flashcardSet(set)
                    .createdAt(LocalDateTime.now())
                    .build();
            favoriteSetRepository.save(favorite);
        }
    }

    @Override
    public boolean isFavorite(Long setId) {
        User user = getCurrentUser();
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));
        return favoriteSetRepository.existsByUserAndFlashcardSet(user, set);
    }

    @Override
    public List<FlashcardSetResponse> getMyFavorites() {
        User user = getCurrentUser();
        return favoriteSetRepository.findAllByUser(user).stream()
                .map(fav -> {
                    FlashcardSet set = fav.getFlashcardSet();
                    return FlashcardSetResponse.builder()
                            .id(set.getId())
                            .title(set.getTitle())
                            .description(set.getDescription())
                            .visibility(set.getVisibility())
                            .createdAt(set.getCreatedAt())
                            .folderId(set.getFolder() != null ? set.getFolder().getId() : null)
                            .flashcardCount(set.getFlashcards() != null ? set.getFlashcards().size() : 0)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
