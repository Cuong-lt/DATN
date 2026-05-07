package com.ltcuong.flashy_be.service.impl;

import com.ltcuong.flashy_be.dto.request.ChangePasswordRequest;
import com.ltcuong.flashy_be.dto.request.UpdateEmailRequest;
import com.ltcuong.flashy_be.dto.response.DailyActivityResponse;
import com.ltcuong.flashy_be.dto.response.QuizHistoryPoint;
import com.ltcuong.flashy_be.dto.response.UserActivityResponse;
import com.ltcuong.flashy_be.dto.response.UserResponse;
import com.ltcuong.flashy_be.dto.response.UserStatsResponse;
import com.ltcuong.flashy_be.entity.Quiz;
import com.ltcuong.flashy_be.entity.User;
import com.ltcuong.flashy_be.exception.AppException;
import com.ltcuong.flashy_be.exception.ErrorCode;
import com.ltcuong.flashy_be.repository.FlashcardRepository;
import com.ltcuong.flashy_be.repository.FlashcardSetRepository;
import com.ltcuong.flashy_be.repository.FolderRepository;
import com.ltcuong.flashy_be.repository.QuizRepository;
import com.ltcuong.flashy_be.repository.UserProgressRepository;
import com.ltcuong.flashy_be.repository.UserRepository;
import com.ltcuong.flashy_be.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;
    private final FolderRepository folderRepository;
    private final QuizRepository quizRepository;
    private final UserProgressRepository userProgressRepository;
    private final PasswordEncoder passwordEncoder;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Override
    public UserResponse getMyProfile() {
        User user = getCurrentUser();
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .totalSets(flashcardSetRepository.countByUser(user))
                .totalFolders(folderRepository.countByUser(user))
                .build();
    }

    @Override
    public UserStatsResponse getMyStats() {
        User user = getCurrentUser();

        long totalSets = flashcardSetRepository.countByUser(user);
        long totalFolders = folderRepository.countByUser(user);
        long totalCards = flashcardRepository.countByUser(user);
        long totalQuizzes = quizRepository.countByUser(user);
        long perfectQuizzes = quizRepository.countPerfectQuizzes(user);
        long totalCorrect = quizRepository.sumCorrectAnswers(user);
        long totalQuestions = quizRepository.sumTotalQuestions(user);

        // Find best quiz score
        int bestScore = 0;
        int bestTotal = 0;
        List<Quiz> quizzes = quizRepository.findAllByUserOrderByCreatedAtDesc(user);
        for (Quiz q : quizzes) {
            if (q.getTotalQuestion() > 0) {
                double pct = (double) q.getScore() / q.getTotalQuestion();
                double bestPct = bestTotal > 0 ? (double) bestScore / bestTotal : 0;
                if (pct > bestPct) {
                    bestScore = q.getScore();
                    bestTotal = q.getTotalQuestion();
                }
            }
        }

        // Calculate study streak from quiz dates
        Set<LocalDate> studyDays = new TreeSet<>();
        for (Quiz q : quizzes) {
            if (q.getCreatedAt() != null) {
                studyDays.add(q.getCreatedAt().toLocalDate());
            }
        }

        int currentStreak = 0;
        int longestStreak = 0;
        if (!studyDays.isEmpty()) {
            LocalDate today = LocalDate.now();
            LocalDate check = today;
            // Current streak: count consecutive days ending today or yesterday
            if (studyDays.contains(today)) {
                while (studyDays.contains(check)) {
                    currentStreak++;
                    check = check.minusDays(1);
                }
            } else if (studyDays.contains(today.minusDays(1))) {
                check = today.minusDays(1);
                while (studyDays.contains(check)) {
                    currentStreak++;
                    check = check.minusDays(1);
                }
            }

            // Longest streak
            int streak = 0;
            LocalDate prev = null;
            for (LocalDate day : studyDays) {
                if (prev != null && day.equals(prev.plusDays(1))) {
                    streak++;
                } else {
                    streak = 1;
                }
                longestStreak = Math.max(longestStreak, streak);
                prev = day;
            }
        }

        return UserStatsResponse.builder()
                .totalSets(totalSets)
                .totalFolders(totalFolders)
                .totalCards(totalCards)
                .totalQuizzes(totalQuizzes)
                .perfectQuizzes(perfectQuizzes)
                .bestQuizScore(bestScore)
                .bestQuizTotal(bestTotal)
                .totalCorrectAnswers(totalCorrect)
                .totalQuestions(totalQuestions)
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .totalReviews(totalQuizzes)
                .memberSince(user.getCreatedAt())
                .build();
    }

    @Override
    public UserActivityResponse getMyActivity() {
        User user = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime since30 = now.minusDays(29).toLocalDate().atStartOfDay();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // --- Daily activity: last 30 days ---
        List<Quiz> recentAll = quizRepository.findByUserAndCreatedAtAfter(user, since30);

        Map<String, Integer> dayMap = new LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            dayMap.put(now.minusDays(i).toLocalDate().format(fmt), 0);
        }
        for (Quiz q : recentAll) {
            String day = q.getCreatedAt().toLocalDate().format(fmt);
            dayMap.merge(day, 1, Integer::sum);
        }
        List<DailyActivityResponse> dailyActivity = dayMap.entrySet().stream()
                .map(e -> new DailyActivityResponse(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // --- Recent quiz history: last 20 quizzes ---
        List<Quiz> allQuizzes = quizRepository.findAllByUserOrderByCreatedAtDesc(user);
        List<QuizHistoryPoint> recentQuizzes = allQuizzes.stream()
                .limit(20)
                .map(q -> {
                    int acc = q.getTotalQuestion() > 0
                            ? (int) Math.round((double) q.getScore() / q.getTotalQuestion() * 100)
                            : 0;
                    return new QuizHistoryPoint(
                            q.getCreatedAt().format(fmt),
                            q.getFlashcardSet().getTitle(),
                            q.getScore(),
                            q.getTotalQuestion(),
                            acc
                    );
                })
                .collect(Collectors.toList());

        // --- Overall stats ---
        long totalCards   = flashcardRepository.countByUser(user);
        long totalSets    = flashcardSetRepository.countByUser(user);
        long totalQuizzes = quizRepository.countByUser(user);
        long totalCorrect = quizRepository.sumCorrectAnswers(user);
        long totalQuestions = quizRepository.sumTotalQuestions(user);
        int accuracy = totalQuestions > 0
                ? (int) Math.round((double) totalCorrect / totalQuestions * 100) : 0;

        // --- Streak (reuse logic from getMyStats) ---
        Set<LocalDate> studyDays = new TreeSet<>();
        for (Quiz q : allQuizzes) {
            if (q.getCreatedAt() != null) studyDays.add(q.getCreatedAt().toLocalDate());
        }
        int currentStreak = 0, longestStreak = 0;
        if (!studyDays.isEmpty()) {
            LocalDate today = LocalDate.now();
            LocalDate check = studyDays.contains(today) ? today : today.minusDays(1);
            if (studyDays.contains(check)) {
                while (studyDays.contains(check)) { currentStreak++; check = check.minusDays(1); }
            }
            int streak = 0; LocalDate prev = null;
            for (LocalDate day : studyDays) {
                streak = (prev != null && day.equals(prev.plusDays(1))) ? streak + 1 : 1;
                longestStreak = Math.max(longestStreak, streak);
                prev = day;
            }
        }

        // --- SRS overall ---
        long srsTracked = userProgressRepository.countAllTrackedCards(user);
        long srsLearned = userProgressRepository.countAllLearnedCards(user, now);
        long srsDue     = userProgressRepository.countAllDueCards(user, now);
        long srsNew     = Math.max(0, totalCards - srsTracked);

        return UserActivityResponse.builder()
                .totalCards(totalCards)
                .totalSets(totalSets)
                .totalQuizzes(totalQuizzes)
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .overallAccuracy(accuracy)
                .dailyActivity(dailyActivity)
                .recentQuizzes(recentQuizzes)
                .srsTotal((int) totalCards)
                .srsDue((int) (srsDue + srsNew))
                .srsLearned((int) srsLearned)
                .srsNew((int) srsNew)
                .build();
    }

    @Override
    @Transactional
    public UserResponse updateEmail(UpdateEmailRequest request) {
        User user = getCurrentUser();
        if (userRepository.existsByEmail(request.getEmail()) &&
                !request.getEmail().equals(user.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        user.setEmail(request.getEmail());
        userRepository.save(user);
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .totalSets(flashcardSetRepository.countByUser(user))
                .totalFolders(folderRepository.countByUser(user))
                .build();
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteAccount() {
        User user = getCurrentUser();
        userRepository.delete(user);
    }
}
