package com.ltcuong.flashy_be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FolderRequest {

    @NotBlank(message = "Folder name is required")
    private String name;
}