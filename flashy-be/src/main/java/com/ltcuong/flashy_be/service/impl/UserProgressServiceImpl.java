package com.ltcuong.flashy_be.service.impl;

import com.ltcuong.flashy_be.dto.request.SRSReviewRequest;
import com.ltcuong.flashy_be.dto.response.SRSCardResponse;
import com.ltcuong.flashy_be.dto.response.SRSSetSummary;
import com.ltcuong.flashy_be.dto.response.SRSStatsResponse;
import com.ltcuong.flashy_be.entity.Flashcard;
import com.ltcuong.flashy_be.entity.FlashcardSet;
import com.ltcuong.flashy_be.entity.User;
import com.ltcuong.flashy_be.entity.UserProgress;
import com.ltcuong.flashy_be.exception.AppException;
import com.ltcuong.flashy_be.exception.ErrorCode;
import com.ltcuong.flashy_be.repository.FlashcardRepository;
import com.ltcuong.flashy_be.repository.FlashcardSetRepository;
import com.ltcuong.flashy_be.repository.UserProgressRepository;
import com.ltcuong.flashy_be.repository.UserRepository;
import com.ltcuong.flashy_be.service.UserProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserProgressServiceImpl implements UserProgressService {

    private static final double DEFAULT_EASE_FACTOR = 2.5;
    private static final double MIN_EASE_FACTOR = 1.3;

    private final UserProgressRepository userProgressRepository;
    private final FlashcardRepository flashcardRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private SRSCardResponse toResponse(UserProgress up) {
        return SRSCardResponse.builder()
                .flashcardId(up.getFlashcard().getId())
                .term(up.getFlashcard().getTerm())
                .definition(up.getFlashcard().getDefinition())
                .repetition(up.getRepetition())
                .easeFactor(up.getEaseFactor())
                .intervalDays(up.getIntervalDays())
                .nextReview(up.getNextReview())
                .reviewCount(up.getReviewCount())
                .correctCount(up.getCorrectCount())
                .build();
    }

    @Override
    public List<SRSCardResponse> getDueCards(Long setId) {
        User user = getCurrentUser();
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));


        List<UserProgress> dueProgress = userProgressRepository.findDueCards(user, setId, LocalDateTime.now());


        List<Flashcard> allCards = flashcardRepository.findAllByFlashcardSet(set);
        List<Long> trackedIds = userProgressRepository.findAllByUserAndSetId(user, setId)
                .stream().map(up -> up.getFlashcard().getId()).collect(Collectors.toList());

        List<Flashcard> newCards = allCards.stream()
                .filter(fc -> !trackedIds.contains(fc.getId()))
                .collect(Collectors.toList());


        List<SRSCardResponse> result = dueProgress.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        for (Flashcard fc : newCards) {
            result.add(SRSCardResponse.builder()
                    .flashcardId(fc.getId())
                    .term(fc.getTerm())
                    .definition(fc.getDefinition())
                    .repetition(0)
                    .easeFactor(DEFAULT_EASE_FACTOR)
                    .intervalDays(0)
                    .nextReview(null)
                    .reviewCount(0)
                    .correctCount(0)
                    .build());
        }

        return result;
    }

    @Override
    @Transactional
    public SRSCardResponse reviewCard(Long setId, SRSReviewRequest request) {
        User user = getCurrentUser();
        Flashcard flashcard = flashcardRepository.findById(request.getFlashcardId())
                .orElseThrow(() -> new AppException(ErrorCode.FLASHCARD_NOT_FOUND));

        UserProgress progress = userProgressRepository.findByUserAndFlashcard(user, flashcard)
                .orElseGet(() -> UserProgress.builder()
                        .user(user)
                        .flashcard(flashcard)
                        .reviewCount(0)
                        .correctCount(0)
                        .repetition(0)
                        .easeFactor(DEFAULT_EASE_FACTOR)
                        .intervalDays(0)
                        .build());

        int quality = request.getQuality();
        int repetition = progress.getRepetition() != null ? progress.getRepetition() : 0;
        double easeFactor = progress.getEaseFactor() != null ? progress.getEaseFactor() : DEFAULT_EASE_FACTOR;
        int intervalDays;

// thuat toan ghi nho
        if (quality < 3) {

            repetition = 0;
            intervalDays = 1;
        } else {

            if (repetition == 0) {
                intervalDays = 1;
            } else if (repetition == 1) {
                intervalDays = 6;
            } else {
                int prevInterval = progress.getIntervalDays() != null ? progress.getIntervalDays() : 1;
                intervalDays = (int) Math.round(prevInterval * easeFactor);
            }
            repetition++;
        }


        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);


        progress.setRepetition(repetition);
        progress.setEaseFactor(easeFactor);
        progress.setIntervalDays(intervalDays);
        progress.setLastReviewed(LocalDateTime.now());
        progress.setNextReview(LocalDateTime.now().plusDays(intervalDays));
        progress.setReviewCount((progress.getReviewCount() != null ? progress.getReviewCount() : 0) + 1);
        if (quality >= 3) {
            progress.setCorrectCount((progress.getCorrectCount() != null ? progress.getCorrectCount() : 0) + 1);
        }

        UserProgress saved = userProgressRepository.save(progress);
        return toResponse(saved);
    }

    @Override
    public SRSStatsResponse getStats(Long setId) {
        User user = getCurrentUser();
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));

        List<Flashcard> allCards = flashcardRepository.findAllByFlashcardSet(set);
        int total = allCards.size();

        List<UserProgress> allProgress = userProgressRepository.findAllByUserAndSetId(user, setId);
        int tracked = allProgress.size();
        int newCards = total - tracked;

        LocalDateTime now = LocalDateTime.now();
        long learned = userProgressRepository.countLearnedCards(user, setId, now);
        List<UserProgress> due = userProgressRepository.findDueCards(user, setId, now);
        int dueCount = due.size() + newCards; // thẻ mới cũng tính là cần học

        return SRSStatsResponse.builder()
                .setId(setId)
                .setTitle(set.getTitle())
                .totalCards(total)
                .dueCards(dueCount)
                .learnedCards((int) learned)
                .newCards(newCards)
                .build();
    }

    @Override
    public List<SRSSetSummary> getOverview() {
        User user = getCurrentUser();
        List<FlashcardSet> sets = flashcardSetRepository.findAllByUser(user);
        LocalDateTime now = LocalDateTime.now();

        return sets.stream().map(set -> {
            List<Flashcard> allCards = flashcardRepository.findAllByFlashcardSet(set);
            int total = allCards.size();
            if (total == 0) return null;

            List<UserProgress> tracked = userProgressRepository.findAllByUserAndSetId(user, set.getId());
            int newCards = total - tracked.size();
            long learned = userProgressRepository.countLearnedCards(user, set.getId(), now);
            List<UserProgress> due = userProgressRepository.findDueCards(user, set.getId(), now);
            int dueCount = due.size() + newCards;

            return SRSSetSummary.builder()
                    .setId(set.getId())
                    .setTitle(set.getTitle())
                    .totalCards(total)
                    .dueCards(dueCount)
                    .learnedCards((int) learned)
                    .newCards(newCards)
                    .build();
        }).filter(s -> s != null).collect(Collectors.toList());
    }
}
