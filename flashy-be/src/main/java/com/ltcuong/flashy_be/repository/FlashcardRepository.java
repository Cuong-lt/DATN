package com.ltcuong.flashy_be.repository;

import com.ltcuong.flashy_be.entity.Flashcard;
import com.ltcuong.flashy_be.entity.FlashcardSet;
import com.ltcuong.flashy_be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findAllByFlashcardSet(FlashcardSet flashcardSet);

    @Query("SELECT COUNT(f) FROM Flashcard f WHERE f.flashcardSet = :flashcardSet")
    long countByFlashcardSet(FlashcardSet flashcardSet);

    @Query("SELECT COUNT(f) FROM Flashcard f WHERE f.flashcardSet.user = :user")
    long countByUser(User user);
}
