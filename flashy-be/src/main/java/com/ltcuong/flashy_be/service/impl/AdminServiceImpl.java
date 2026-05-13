package com.ltcuong.flashy_be.service.impl;

import com.ltcuong.flashy_be.dto.request.AdminUpdateUserRequest;
import com.ltcuong.flashy_be.dto.response.AdminDashboardResponse;
import com.ltcuong.flashy_be.dto.response.AdminUserResponse;
import com.ltcuong.flashy_be.entity.User;
import com.ltcuong.flashy_be.exception.AppException;
import com.ltcuong.flashy_be.exception.ErrorCode;
import com.ltcuong.flashy_be.repository.*;
import com.ltcuong.flashy_be.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;
    private final FolderRepository folderRepository;
    private final QuizRepository quizRepository;
    private final PasswordEncoder passwordEncoder;

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
