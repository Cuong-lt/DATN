package com.ltcuong.flashy_be.service.impl;

import com.ltcuong.flashy_be.dto.request.FlashcardRequest;
import com.ltcuong.flashy_be.dto.request.FlashcardSetRequest;
import com.ltcuong.flashy_be.dto.response.FlashcardResponse;
import com.ltcuong.flashy_be.dto.response.FlashcardSetResponse;
import com.ltcuong.flashy_be.dto.response.PageResponse;
import com.ltcuong.flashy_be.entity.Flashcard;
import com.ltcuong.flashy_be.entity.FlashcardSet;
import com.ltcuong.flashy_be.entity.Folder;
import com.ltcuong.flashy_be.entity.User;
import com.ltcuong.flashy_be.exception.AppException;
import com.ltcuong.flashy_be.exception.ErrorCode;
import com.ltcuong.flashy_be.repository.FlashcardRepository;
import com.ltcuong.flashy_be.repository.FlashcardSetRepository;
import com.ltcuong.flashy_be.repository.FolderRepository;
import com.ltcuong.flashy_be.repository.UserRepository;
import com.ltcuong.flashy_be.service.FlashcardSetService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashcardSetServiceImpl implements FlashcardSetService {

    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private FlashcardResponse toFlashcardResponse(Flashcard card) {
        return FlashcardResponse.builder()
                .id(card.getId())
                .term(card.getTerm())
                .definition(card.getDefinition())
                .createdAt(card.getCreatedAt())
                .setId(card.getFlashcardSet().getId())
                .build();
    }

    private FlashcardSetResponse toResponse(FlashcardSet set) {
        List<FlashcardResponse> flashcards = set.getFlashcards() != null
                ? set.getFlashcards().stream().map(this::toFlashcardResponse).collect(Collectors.toList())
                : Collections.emptyList();

        return FlashcardSetResponse.builder()
                .id(set.getId())
                .title(set.getTitle())
                .description(set.getDescription())
                .visibility(set.getVisibility())
                .createdAt(set.getCreatedAt())
                .folderId(set.getFolder() != null ? set.getFolder().getId() : null)
                .username(set.getUser() != null ? set.getUser().getUsername() : null)
                .flashcardCount(flashcards.size())
                .flashcards(flashcards)
                .build();
    }

    private FlashcardSetResponse toResponseForExport(FlashcardSet set) {
        long count = flashcardRepository.countByFlashcardSet(set);
        return FlashcardSetResponse.builder()
                .id(set.getId())
                .title(set.getTitle())
                .description(set.getDescription())
                .visibility(set.getVisibility())
                .createdAt(set.getCreatedAt())
                .folderId(set.getFolder() != null ? set.getFolder().getId() : null)
                .username(set.getUser() != null ? set.getUser().getUsername() : null)
                .flashcardCount((int) count)
                .build();
    }

    @Override
    public List<FlashcardSetResponse> getMySets() {
        User user = getCurrentUser();
        return flashcardSetRepository.findAllByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FlashcardSetResponse> getMySetsForExport() {
        User user = getCurrentUser();
        return flashcardSetRepository.findAllByUser(user).stream()
                .map(this::toResponseForExport)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<FlashcardSetResponse> getMySets(int page, int size) {
        User user = getCurrentUser();
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FlashcardSet> pageResult = flashcardSetRepository.findAllByUser(user, pageable);
        return PageResponse.<FlashcardSetResponse>builder()
                .content(pageResult.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    public PageResponse<FlashcardSetResponse> searchPublicSets(String keyword, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FlashcardSet> pageResult = flashcardSetRepository
                .findAllByTitleContainingIgnoreCaseAndVisibility(keyword, "public", pageable);
        return PageResponse.<FlashcardSetResponse>builder()
                .content(pageResult.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    public List<FlashcardSetResponse> getSetsByFolder(Long folderId) {
        User user = getCurrentUser();
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));

        if (!folder.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        return flashcardSetRepository.findAllByFolder(folder).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FlashcardSetResponse> searchSetsByFolder(Long folderId, String keyword) {
        User user = getCurrentUser();
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));

        if (!folder.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        return flashcardSetRepository.findAllByFolderAndTitleContainingIgnoreCase(folder, keyword).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FlashcardSetResponse getSetById(Long id) {
        User user = getCurrentUser();
        FlashcardSet set = flashcardSetRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));

        if (!set.getUser().getId().equals(user.getId()) && !"public".equals(set.getVisibility())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        return toResponse(set);
    }

    @Override
    @Transactional
    public FlashcardSetResponse createSet(FlashcardSetRequest request) {
        User user = getCurrentUser();

        Folder folder = null;
        if (request.getFolderId() != null) {
            folder = folderRepository.findById(request.getFolderId())
                    .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));
            if (!folder.getUser().getId().equals(user.getId())) {
                throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
            }
        }

        FlashcardSet set = FlashcardSet.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .visibility(request.getVisibility() != null ? request.getVisibility() : "private")
                .createdAt(LocalDateTime.now())
                .user(user)
                .folder(folder)
                .build();

        FlashcardSet savedSet = flashcardSetRepository.save(set);

        if (request.getFlashcards() != null && !request.getFlashcards().isEmpty()) {
            List<Flashcard> cards = request.getFlashcards().stream()
                    .map(fc -> Flashcard.builder()
                            .term(fc.getTerm())
                            .definition(fc.getDefinition())
                            .createdAt(LocalDateTime.now())
                            .flashcardSet(savedSet)
                            .build())
                    .collect(Collectors.toList());
            flashcardRepository.saveAll(cards);
        }

        return toResponse(flashcardSetRepository.findById(savedSet.getId()).orElseThrow());
    }

    @Override
    public FlashcardSetResponse updateSet(Long id, FlashcardSetRequest request) {
        User user = getCurrentUser();
        FlashcardSet set = flashcardSetRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));

        if (!set.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        Folder folder = null;
        if (request.getFolderId() != null) {
            folder = folderRepository.findById(request.getFolderId())
                    .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));
            if (!folder.getUser().getId().equals(user.getId())) {
                throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
            }
        }

        set.setTitle(request.getTitle());
        set.setDescription(request.getDescription());
        set.setVisibility(request.getVisibility() != null ? request.getVisibility() : set.getVisibility());
        set.setFolder(folder);

        return toResponse(flashcardSetRepository.save(set));
    }

    @Override
    public void deleteSet(Long id) {
        User user = getCurrentUser();
        FlashcardSet set = flashcardSetRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));

        if (!set.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        flashcardSetRepository.delete(set);
    }
}

