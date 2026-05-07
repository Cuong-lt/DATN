package com.ltcuong.flashy_be.repository;

import com.ltcuong.flashy_be.entity.Flashcard;
import com.ltcuong.flashy_be.entity.User;
import com.ltcuong.flashy_be.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    Optional<UserProgress> findByUserAndFlashcard(User user, Flashcard flashcard);

    List<UserProgress> findAllByUser(User user);

    @Query("SELECT up FROM UserProgress up WHERE up.user = :user AND up.flashcard.flashcardSet.id = :setId")
    List<UserProgress> findAllByUserAndSetId(User user, Long setId);

    @Query("SELECT up FROM UserProgress up WHERE up.user = :user AND up.flashcard.flashcardSet.id = :setId AND (up.nextReview IS NULL OR up.nextReview <= :now)")
    List<UserProgress> findDueCards(User user, Long setId, LocalDateTime now);

    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.user = :user AND up.flashcard.flashcardSet.id = :setId AND up.nextReview > :now")
    long countLearnedCards(User user, Long setId, LocalDateTime now);

    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.user = :user AND up.nextReview > :now")
    long countAllLearnedCards(User user, LocalDateTime now);

    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.user = :user AND (up.nextReview IS NULL OR up.nextReview <= :now)")
    long countAllDueCards(User user, LocalDateTime now);

    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.user = :user")
    long countAllTrackedCards(User user);
}
