package com.ltcuong.flashy_be.repository;

import com.ltcuong.flashy_be.entity.FavoriteSet;
import com.ltcuong.flashy_be.entity.FlashcardSet;
import com.ltcuong.flashy_be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteSetRepository extends JpaRepository<FavoriteSet, Long> {
    List<FavoriteSet> findAllByUser(User user);
    Optional<FavoriteSet> findByUserAndFlashcardSet(User user, FlashcardSet flashcardSet);
    boolean existsByUserAndFlashcardSet(User user, FlashcardSet flashcardSet);

    long countByFlashcardSet(FlashcardSet flashcardSet);
}
