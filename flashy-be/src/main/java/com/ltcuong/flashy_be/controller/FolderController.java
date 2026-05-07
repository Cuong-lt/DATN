package com.ltcuong.flashy_be.controller;

import com.ltcuong.flashy_be.dto.request.FolderRequest;
import com.ltcuong.flashy_be.dto.response.ApiResponse;
import com.ltcuong.flashy_be.dto.response.FlashcardSetResponse;
import com.ltcuong.flashy_be.dto.response.FolderResponse;
import com.ltcuong.flashy_be.service.FlashcardSetService;
import com.ltcuong.flashy_be.service.FolderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;
    private final FlashcardSetService flashcardSetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FolderResponse>>> getMyFolders() {
        return ResponseEntity.ok(
                ApiResponse.<List<FolderResponse>>builder()
                        .code(200)
                        .message("Folders retrieved successfully")
                        .data(folderService.getMyFolders())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FolderResponse>> getFolderById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<FolderResponse>builder()
                        .code(200)
                        .message("Folder retrieved successfully")
                        .data(folderService.getFolderById(id))
                        .build()
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FolderResponse>> createFolder(@Valid @RequestBody FolderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<FolderResponse>builder()
                        .code(201)
                        .message("Folder created successfully")
                        .data(folderService.createFolder(request))
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FolderResponse>> updateFolder(
            @PathVariable Long id,
            @Valid @RequestBody FolderRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<FolderResponse>builder()
                        .code(200)
                        .message("Folder updated successfully")
                        .data(folderService.updateFolder(id, request))
                        .build()
        );
    }

    @GetMapping("/{id}/sets")
    public ResponseEntity<ApiResponse<List<FlashcardSetResponse>>> getSetsByFolder(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<List<FlashcardSetResponse>>builder()
                        .code(200)
                        .message("Sets retrieved successfully")
                        .data(flashcardSetService.getSetsByFolder(id))
                        .build()
        );
    }

    @GetMapping("/{id}/sets/search")
    public ResponseEntity<ApiResponse<List<FlashcardSetResponse>>> searchSetsByFolder(
            @PathVariable Long id,
            @RequestParam String keyword) {
        return ResponseEntity.ok(
                ApiResponse.<List<FlashcardSetResponse>>builder()
                        .code(200)
                        .message("Sets retrieved successfully")
                        .data(flashcardSetService.searchSetsByFolder(id, keyword))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(@PathVariable Long id) {
        folderService.deleteFolder(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Folder deleted successfully")
                        .build()
        );
    }
}