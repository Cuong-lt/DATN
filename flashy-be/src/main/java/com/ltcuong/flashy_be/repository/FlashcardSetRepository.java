package com.ltcuong.flashy_be.repository;

import com.ltcuong.flashy_be.entity.FlashcardSet;
import com.ltcuong.flashy_be.entity.Folder;
import com.ltcuong.flashy_be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FlashcardSetRepository extends JpaRepository<FlashcardSet, Long> {
    List<FlashcardSet> findAllByUser(User user);
    List<FlashcardSet> findAllByFolder(Folder folder);
    List<FlashcardSet> findAllByFolderAndTitleContainingIgnoreCase(Folder folder, String title);

    Page<FlashcardSet> findAllByUser(User user, Pageable pageable);
    Page<FlashcardSet> findAllByTitleContainingIgnoreCaseAndVisibility(String title, String visibility, Pageable pageable);

    long countByUser(User user);

    Page<FlashcardSet> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<FlashcardSet> findByVisibility(String visibility, Pageable pageable);

    Page<FlashcardSet> findByTitleContainingIgnoreCaseAndVisibility(String title, String visibility, Pageable pageable);

    long countByCreatedAtBetween(java.time.LocalDateTime from, java.time.LocalDateTime to);

    @Query("SELECT COUNT(s) FROM FlashcardSet s WHERE s.createdAt >= :since")
    long countNewSetsSince(@org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);
}