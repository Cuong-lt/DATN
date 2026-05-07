package com.ltcuong.flashy_be.service;

import com.ltcuong.flashy_be.dto.request.ChangePasswordRequest;
import com.ltcuong.flashy_be.dto.request.UpdateEmailRequest;
import com.ltcuong.flashy_be.dto.response.UserActivityResponse;
import com.ltcuong.flashy_be.dto.response.UserResponse;
import com.ltcuong.flashy_be.dto.response.UserStatsResponse;

public interface UserService {
    UserResponse getMyProfile();
    UserStatsResponse getMyStats();
    UserActivityResponse getMyActivity();
    UserResponse updateEmail(UpdateEmailRequest request);
    void changePassword(ChangePasswordRequest request);
    void deleteAccount();
}
