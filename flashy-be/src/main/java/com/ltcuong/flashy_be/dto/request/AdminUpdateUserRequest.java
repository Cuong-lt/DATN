package com.ltcuong.flashy_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateUserRequest {
    private String email;
    private String role;
    private String newPassword;
    private Boolean locked;
}
