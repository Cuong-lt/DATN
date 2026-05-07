package com.ltcuong.flashy_be.service.impl;

import com.ltcuong.flashy_be.dto.request.FlashcardRequest;
import com.ltcuong.flashy_be.dto.response.FlashcardResponse;
import com.ltcuong.flashy_be.entity.Flashcard;
import com.ltcuong.flashy_be.entity.FlashcardSet;
import com.ltcuong.flashy_be.entity.User;
import com.ltcuong.flashy_be.exception.AppException;
import com.ltcuong.flashy_be.exception.ErrorCode;
import com.ltcuong.flashy_be.repository.FlashcardRepository;
import com.ltcuong.flashy_be.repository.FlashcardSetRepository;
import com.ltcuong.flashy_be.repository.UserRepository;
import com.ltcuong.flashy_be.service.FlashcardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashcardServiceImpl implements FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private FlashcardResponse toResponse(Flashcard card) {
        return FlashcardResponse.builder()
                .id(card.getId())
                .term(card.getTerm())
                .definition(card.getDefinition())
                .createdAt(card.getCreatedAt())
                .setId(card.getFlashcardSet().getId())
                .build();
    }

    @Override
    public List<FlashcardResponse> getFlashcardsBySet(Long setId) {
        User user = getCurrentUser();
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));

        if (!set.getUser().getId().equals(user.getId()) && !"public".equals(set.getVisibility())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        return flashcardRepository.findAllByFlashcardSet(set).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FlashcardResponse createFlashcard(Long setId, FlashcardRequest request) {
        User user = getCurrentUser();
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));

        if (!set.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        Flashcard card = Flashcard.builder()
                .term(request.getTerm())
                .definition(request.getDefinition())
                .createdAt(LocalDateTime.now())
                .flashcardSet(set)
                .build();

        return toResponse(flashcardRepository.save(card));
    }

    @Override
    public FlashcardResponse updateFlashcard(Long id, FlashcardRequest request) {
        User user = getCurrentUser();
        Flashcard card = flashcardRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FLASHCARD_NOT_FOUND));

        if (!card.getFlashcardSet().getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        card.setTerm(request.getTerm());
        card.setDefinition(request.getDefinition());

        return toResponse(flashcardRepository.save(card));
    }

    @Override
    public void deleteFlashcard(Long id) {
        User user = getCurrentUser();
        Flashcard card = flashcardRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FLASHCARD_NOT_FOUND));

        if (!card.getFlashcardSet().getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        flashcardRepository.delete(card);
    }
}