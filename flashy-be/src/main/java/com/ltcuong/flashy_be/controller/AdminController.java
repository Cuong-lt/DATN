package com.ltcuong.flashy_be.controller;

import com.ltcuong.flashy_be.dto.request.AdminUpdateUserRequest;
import com.ltcuong.flashy_be.dto.request.BroadcastNotificationRequest;
import com.ltcuong.flashy_be.dto.response.AdminDashboardResponse;
import com.ltcuong.flashy_be.dto.response.AdminSetResponse;
import com.ltcuong.flashy_be.dto.response.AdminTrendResponse;
import com.ltcuong.flashy_be.dto.response.AdminUserResponse;
import com.ltcuong.flashy_be.dto.response.ApiResponse;
import com.ltcuong.flashy_be.dto.response.BroadcastNotificationResult;
import com.ltcuong.flashy_be.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(
                ApiResponse.<AdminDashboardResponse>builder()
                        .code(200)
                        .message("Dashboard stats retrieved successfully")
                        .data(adminService.getDashboardStats())
                        .build()
        );
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(
                ApiResponse.<Page<AdminUserResponse>>builder()
                        .code(200)
                        .message("Users retrieved successfully")
                        .data(adminService.getAllUsers(search, PageRequest.of(page, size, sort)))
                        .build()
        );
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<AdminUserResponse>builder()
                        .code(200)
                        .message("User retrieved successfully")
                        .data(adminService.getUserById(id))
                        .build()
        );
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody AdminUpdateUserRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<AdminUserResponse>builder()
                        .code(200)
                        .message("User updated successfully")
                        .data(adminService.updateUser(id, request))
                        .build()
        );
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("User deleted successfully")
                        .build()
        );
    }

    @GetMapping("/trends")
    public ResponseEntity<ApiResponse<AdminTrendResponse>> getTrends() {
        return ResponseEntity.ok(
                ApiResponse.<AdminTrendResponse>builder()
                        .code(200)
                        .message("Trends retrieved successfully")
                        .data(adminService.getAdminTrends())
                        .build()
        );
    }

    @GetMapping("/sets")
    public ResponseEntity<ApiResponse<Page<AdminSetResponse>>> getAllSets(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "ALL") String visibility,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(
                ApiResponse.<Page<AdminSetResponse>>builder()
                        .code(200)
                        .message("Sets retrieved successfully")
                        .data(adminService.getAllSets(search, visibility, PageRequest.of(page, size, sort)))
                        .build()
        );
    }

    @DeleteMapping("/sets/{id}")
    public ResponseEntity<ApiResponse<Void>> adminDeleteSet(@PathVariable Long id) {
        adminService.adminDeleteSet(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Set deleted successfully")
                        .build()
        );
    }

    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<BroadcastNotificationResult>> sendBroadcast(
            @RequestBody BroadcastNotificationRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<BroadcastNotificationResult>builder()
                        .code(200)
                        .message("Broadcast notification sent")
                        .data(adminService.sendBroadcastNotification(request))
                        .build()
        );
    }
}
