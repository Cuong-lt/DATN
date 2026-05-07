package com.ltcuong.flashy_be.controller;

import com.ltcuong.flashy_be.dto.request.ChangePasswordRequest;
import com.ltcuong.flashy_be.dto.request.UpdateEmailRequest;
import com.ltcuong.flashy_be.dto.response.ApiResponse;
import com.ltcuong.flashy_be.dto.response.UserActivityResponse;
import com.ltcuong.flashy_be.dto.response.UserResponse;
import com.ltcuong.flashy_be.dto.response.UserStatsResponse;
import com.ltcuong.flashy_be.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile() {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .code(200)
                        .message("Profile retrieved successfully")
                        .data(userService.getMyProfile())
                        .build()
        );
    }

    @GetMapping("/me/stats")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getMyStats() {
        return ResponseEntity.ok(
                ApiResponse.<UserStatsResponse>builder()
                        .code(200)
                        .message("Stats retrieved successfully")
                        .data(userService.getMyStats())
                        .build()
        );
    }

    @GetMapping("/me/activity")
    public ResponseEntity<ApiResponse<UserActivityResponse>> getMyActivity() {
        return ResponseEntity.ok(
                ApiResponse.<UserActivityResponse>builder()
                        .code(200)
                        .message("Activity retrieved successfully")
                        .data(userService.getMyActivity())
                        .build()
        );
    }

    @PutMapping("/me/email")
    public ResponseEntity<ApiResponse<UserResponse>> updateEmail(@Valid @RequestBody UpdateEmailRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .code(200)
                        .message("Email updated successfully")
                        .data(userService.updateEmail(request))
                        .build()
        );
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Password changed successfully")
                        .build()
        );
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        userService.deleteAccount();
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Account deleted successfully")
                        .build()
        );
    }
}
