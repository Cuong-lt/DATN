package com.ltcuong.flashy_be.service;

import com.ltcuong.flashy_be.dto.request.AdminUpdateUserRequest;
import com.ltcuong.flashy_be.dto.response.AdminDashboardResponse;
import com.ltcuong.flashy_be.dto.response.AdminUserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    AdminDashboardResponse getDashboardStats();
    Page<AdminUserResponse> getAllUsers(String search, Pageable pageable);
    AdminUserResponse getUserById(Long id);
    AdminUserResponse updateUser(Long id, AdminUpdateUserRequest request);
    void deleteUser(Long id);
}
