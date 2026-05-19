package com.ltcuong.flashy_be.service.impl;

import com.ltcuong.flashy_be.dto.request.AdminUpdateUserRequest;
import com.ltcuong.flashy_be.dto.request.BroadcastNotificationRequest;
import com.ltcuong.flashy_be.dto.response.AdminDashboardResponse;
import com.ltcuong.flashy_be.dto.response.AdminSetResponse;
import com.ltcuong.flashy_be.dto.response.AdminTrendResponse;
import com.ltcuong.flashy_be.dto.response.AdminUserResponse;
import com.ltcuong.flashy_be.dto.response.BroadcastNotificationResult;
import com.ltcuong.flashy_be.dto.response.MonthlyDataPoint;
import com.ltcuong.flashy_be.entity.FlashcardSet;
import com.ltcuong.flashy_be.entity.User;
import com.ltcuong.flashy_be.exception.AppException;
import com.ltcuong.flashy_be.exception.ErrorCode;
import com.ltcuong.flashy_be.repository.*;
import com.ltcuong.flashy_be.service.AdminService;
import com.ltcuong.flashy_be.service.EmailService;
import com.ltcuong.flashy_be.repository.FavoriteSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;
    private final FolderRepository folderRepository;
    private final QuizRepository quizRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final FavoriteSetRepository favoriteSetRepository;

    @Override
    public AdminDashboardResponse getDashboardStats() {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        return AdminDashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalSets(flashcardSetRepository.count())
                .totalFlashcards(flashcardRepository.count())
                .totalQuizzes(quizRepository.count())
                .totalFolders(folderRepository.count())
                .newUsersThisMonth(userRepository.countNewUsersSince(startOfMonth))
                .newSetsThisMonth(flashcardSetRepository.countNewSetsSince(startOfMonth))
                .newQuizzesThisMonth(quizRepository.countNewQuizzesSince(startOfMonth))
                .build();
    }

    @Override
    public Page<AdminUserResponse> getAllUsers(String search, Pageable pageable) {
        Page<User> users;
        if (search != null && !search.isBlank()) {
            users = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search, search, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        return users.map(this::toAdminUserResponse);
    }

    @Override
    public AdminUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return toAdminUserResponse(user);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUser(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            // Check email uniqueness (skip if same)
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            }
            user.setEmail(request.getEmail());
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            user.setRole(request.getRole());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        if (request.getLocked() != null) {
            user.setLocked(request.getLocked());
        }

        userRepository.save(user);
        return toAdminUserResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (user.getUsername().equals(currentUsername)) {
            throw new AppException(ErrorCode.CANNOT_DELETE_SELF);
        }
        userRepository.delete(user);
    }

    @Override
    public BroadcastNotificationResult sendBroadcastNotification(BroadcastNotificationRequest request) {
        List<User> targets;
        String role = request.getTargetRole();
        if ("USER".equalsIgnoreCase(role)) {
            targets = userRepository.findByRole("USER");
        } else if ("ADMIN".equalsIgnoreCase(role)) {
            targets = userRepository.findByRole("ADMIN");
        } else {
            targets = userRepository.findAll();
        }

        int sent = 0;
        int failed = 0;
        for (User user : targets) {
            try {
                emailService.sendBroadcastEmail(user.getEmail(), request.getSubject(), request.getMessage());
                sent++;
            } catch (Exception e) {
                failed++;
            }
        }

        return BroadcastNotificationResult.builder()
                .totalTargeted(targets.size())
                .sentCount(sent)
                .failedCount(failed)
                .build();
    }

    @Override
    public Page<AdminSetResponse> getAllSets(String search, String visibility, Pageable pageable) {
        Page<FlashcardSet> sets;
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasVisibility = visibility != null && !visibility.isBlank() && !visibility.equalsIgnoreCase("ALL");

        if (hasSearch && hasVisibility) {
            sets = flashcardSetRepository.findByTitleContainingIgnoreCaseAndVisibility(search, visibility.toLowerCase(), pageable);
        } else if (hasSearch) {
            sets = flashcardSetRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else if (hasVisibility) {
            sets = flashcardSetRepository.findByVisibility(visibility.toLowerCase(), pageable);
        } else {
            sets = flashcardSetRepository.findAll(pageable);
        }

        return sets.map(this::toAdminSetResponse);
    }

    @Override
    @Transactional
    public void adminDeleteSet(Long id) {
        FlashcardSet set = flashcardSetRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));

        User owner = set.getUser();
        String setTitle = set.getTitle();
        flashcardSetRepository.delete(set);

        try {
            emailService.sendSetDeletedNotification(owner.getEmail(), owner.getUsername(), setTitle);
        } catch (Exception ignored) {
        }
    }

    @Override
    public AdminTrendResponse getAdminTrends() {
        List<MonthlyDataPoint> userGrowth = new ArrayList<>();
        List<MonthlyDataPoint> setGrowth = new ArrayList<>();
        List<MonthlyDataPoint> quizGrowth = new ArrayList<>();

        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i)
                    .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime end = start.plusMonths(1);
            String label = "T" + start.getMonthValue() + "/" + String.valueOf(start.getYear()).substring(2);

            userGrowth.add(new MonthlyDataPoint(label, userRepository.countByCreatedAtBetween(start, end)));
            setGrowth.add(new MonthlyDataPoint(label, flashcardSetRepository.countByCreatedAtBetween(start, end)));
            quizGrowth.add(new MonthlyDataPoint(label, quizRepository.countByCreatedAtBetween(start, end)));
        }

        return AdminTrendResponse.builder()
                .userGrowth(userGrowth)
                .setGrowth(setGrowth)
                .quizGrowth(quizGrowth)
                .build();
    }

    private AdminSetResponse toAdminSetResponse(FlashcardSet set) {
        long cardCount = flashcardRepository.countByFlashcardSet(set);
        long favoriteCount = favoriteSetRepository.countByFlashcardSet(set);
        return AdminSetResponse.builder()
                .id(set.getId())
                .title(set.getTitle())
                .description(set.getDescription())
                .visibility(set.getVisibility())
                .createdAt(set.getCreatedAt())
                .ownerUsername(set.getUser() != null ? set.getUser().getUsername() : null)
                .ownerId(set.getUser() != null ? set.getUser().getId() : null)
                .cardCount((int) cardCount)
                .favoriteCount((int) favoriteCount)
                .build();
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .locked(Boolean.TRUE.equals(user.getLocked()))
                .createdAt(user.getCreatedAt())
                .totalSets(flashcardSetRepository.countByUser(user))
                .totalFolders(folderRepository.countByUser(user))
                .totalQuizzes(quizRepository.countByUser(user))
                .totalCards(flashcardRepository.countByUser(user))
                .build();
    }
}
