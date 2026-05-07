package com.ltcuong.flashy_be.service;

import com.ltcuong.flashy_be.dto.request.FolderRequest;
import com.ltcuong.flashy_be.dto.response.FolderResponse;

import java.util.List;

public interface FolderService {
    List<FolderResponse> getMyFolders();
    FolderResponse getFolderById(Long id);
    FolderResponse createFolder(FolderRequest request);
    FolderResponse updateFolder(Long id, FolderRequest request);
    void deleteFolder(Long id);
}