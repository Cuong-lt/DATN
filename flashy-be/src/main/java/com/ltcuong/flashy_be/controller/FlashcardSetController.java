package com.ltcuong.flashy_be.controller;

import com.ltcuong.flashy_be.dto.request.FlashcardSetRequest;
import com.ltcuong.flashy_be.dto.response.ApiResponse;
import com.ltcuong.flashy_be.dto.response.FlashcardSetResponse;
import com.ltcuong.flashy_be.dto.response.PageResponse;
import com.ltcuong.flashy_be.service.FlashcardSetService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/sets")
@RequiredArgsConstructor
public class FlashcardSetController {

    private final FlashcardSetService flashcardSetService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<FlashcardSetResponse>>> getMySets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<FlashcardSetResponse>>builder()
                        .code(200)
                        .message("Sets retrieved successfully")
                        .data(flashcardSetService.getMySets(page, size))
                        .build()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<FlashcardSetResponse>>> searchPublicSets(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<FlashcardSetResponse>>builder()
                        .code(200)
                        .message("Sets retrieved successfully")
                        .data(flashcardSetService.searchPublicSets(keyword, page, size))
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlashcardSetResponse>> getSetById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<FlashcardSetResponse>builder()
                        .code(200)
                        .message("Set retrieved successfully")
                        .data(flashcardSetService.getSetById(id))
                        .build()
        );
    }

    @GetMapping("/{id}/export")
    public void exportSetById(@PathVariable Long id, HttpServletResponse response) throws IOException {
        FlashcardSetResponse set = flashcardSetService.getSetById(id);

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=" + set.getTitle().replaceAll("[^a-zA-Z0-9\\s]", "") + "-flashcards.xlsx");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Flashcards");

            String[] headers = new String[]{"Term", "Definition"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }

            int rowIndex = 1;
            if (set.getFlashcards() != null) {
                for (var flashcard : set.getFlashcards()) {
                    Row row = sheet.createRow(rowIndex++);
                    row.createCell(0).setCellValue(flashcard.getTerm());
                    row.createCell(1).setCellValue(flashcard.getDefinition());
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(response.getOutputStream());
            response.getOutputStream().flush();
        }
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportMySets() throws IOException {
        List<FlashcardSetResponse> sets = flashcardSetService.getMySetsForExport();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Study Sets");

            String[] headerLabels = new String[]{"ID", "Title", "Description", "Visibility", "Folder ID", "Username", "Flashcard Count"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headerLabels.length; i++) {
                headerRow.createCell(i).setCellValue(headerLabels[i]);
            }

            for (int i = 0; i < sets.size(); i++) {
                FlashcardSetResponse set = sets.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(set.getId());
                row.createCell(1).setCellValue(set.getTitle());
                row.createCell(2).setCellValue(set.getDescription() != null ? set.getDescription() : "");
                row.createCell(3).setCellValue(set.getVisibility());
                row.createCell(4).setCellValue(set.getFolderId() != null ? set.getFolderId() : -1);
                row.createCell(5).setCellValue(set.getUsername() != null ? set.getUsername() : "");
                row.createCell(6).setCellValue(set.getFlashcardCount());
            }

            for (int i = 0; i < headerLabels.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            byte[] excelBytes = outputStream.toByteArray();

            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            httpHeaders.setContentDispositionFormData("attachment", "flashcard-sets.xlsx");
            httpHeaders.setContentLength(excelBytes.length);

            return ResponseEntity.ok()
                    .headers(httpHeaders)
                    .body(excelBytes);
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FlashcardSetResponse>> createSet(@Valid @RequestBody FlashcardSetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<FlashcardSetResponse>builder()
                        .code(201)
                        .message("Set created successfully")
                        .data(flashcardSetService.createSet(request))
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FlashcardSetResponse>> updateSet(
            @PathVariable Long id,
            @Valid @RequestBody FlashcardSetRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<FlashcardSetResponse>builder()
                        .code(200)
                        .message("Set updated successfully")
                        .data(flashcardSetService.updateSet(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSet(@PathVariable Long id) {
        flashcardSetService.deleteSet(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Set deleted successfully")
                        .build()
        );
    }
}