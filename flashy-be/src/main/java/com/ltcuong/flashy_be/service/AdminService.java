package com.ltcuong.flashy_be.service;

import com.ltcuong.flashy_be.dto.request.AdminUpdateUserRequest;
import com.ltcuong.flashy_be.dto.request.BroadcastNotificationRequest;
import com.ltcuong.flashy_be.dto.response.AdminDashboardResponse;
import com.ltcuong.flashy_be.dto.response.AdminSetResponse;
import com.ltcuong.flashy_be.dto.response.AdminTrendResponse;
import com.ltcuong.flashy_be.dto.response.AdminUserResponse;
import com.ltcuong.flashy_be.dto.response.BroadcastNotificationResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    AdminDashboardResponse getDashboardStats();
    Page<AdminUserResponse> getAllUsers(String search, Pageable pageable);
    AdminUserResponse getUserById(Long id);
    AdminUserResponse updateUser(Long id, AdminUpdateUserRequest request);
    void deleteUser(Long id);
    BroadcastNotificationResult sendBroadcastNotification(BroadcastNotificationRequest request);
    Page<AdminSetResponse> getAllSets(String search, String visibility, Pageable pageable);
    void adminDeleteSet(Long id);
    AdminTrendResponse getAdminTrends();
}
