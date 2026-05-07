package com.ltcuong.flashy_be.repository;

import com.ltcuong.flashy_be.entity.Folder;
import com.ltcuong.flashy_be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findAllByUser(User user);
    long countByUser(User user);
}