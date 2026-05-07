package com.ltcuong.flashy_be.service.impl;

import com.ltcuong.flashy_be.dto.request.FolderRequest;
import com.ltcuong.flashy_be.dto.response.FlashcardSetResponse;
import com.ltcuong.flashy_be.dto.response.FolderResponse;
import com.ltcuong.flashy_be.entity.Folder;
import com.ltcuong.flashy_be.entity.FlashcardSet;
import com.ltcuong.flashy_be.entity.User;
import com.ltcuong.flashy_be.exception.AppException;
import com.ltcuong.flashy_be.exception.ErrorCode;
import com.ltcuong.flashy_be.repository.FolderRepository;
import com.ltcuong.flashy_be.repository.UserRepository;
import com.ltcuong.flashy_be.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private FlashcardSetResponse toSetSummary(FlashcardSet set) {
        return FlashcardSetResponse.builder()
                .id(set.getId())
                .title(set.getTitle())
                .description(set.getDescription())
                .visibility(set.getVisibility())
                .createdAt(set.getCreatedAt())
                .folderId(set.getFolder() != null ? set.getFolder().getId() : null)
                .flashcardCount(set.getFlashcards() != null ? set.getFlashcards().size() : 0)
                .build();
    }

    private FolderResponse toResponse(Folder folder) {
        List<FlashcardSetResponse> sets = folder.getFlashcardSets() != null
                ? folder.getFlashcardSets().stream().map(this::toSetSummary).collect(Collectors.toList())
                : Collections.emptyList();

        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .createdAt(folder.getCreatedAt())
                .sets(sets)
                .build();
    }

    @Override
    public List<FolderResponse> getMyFolders() {
        User user = getCurrentUser();
        return folderRepository.findAllByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FolderResponse getFolderById(Long id) {
        User user = getCurrentUser();
        Folder folder = folderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));

        if (!folder.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        return toResponse(folder);
    }

    @Override
    public FolderResponse createFolder(FolderRequest request) {
        User user = getCurrentUser();

        Folder folder = Folder.builder()
                .name(request.getName())
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        return toResponse(folderRepository.save(folder));
    }

    @Override
    public FolderResponse updateFolder(Long id, FolderRequest request) {
        User user = getCurrentUser();
        Folder folder = folderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));

        if (!folder.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        folder.setName(request.getName());
        return toResponse(folderRepository.save(folder));
    }

    @Override
    public void deleteFolder(Long id) {
        User user = getCurrentUser();
        Folder folder = folderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FOLDER_NOT_FOUND));

        if (!folder.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        folderRepository.delete(folder);
    }
}