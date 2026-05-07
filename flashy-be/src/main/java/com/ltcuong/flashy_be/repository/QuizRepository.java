package com.ltcuong.flashy_be.repository;

import com.ltcuong.flashy_be.entity.FlashcardSet;
import com.ltcuong.flashy_be.entity.Quiz;
import com.ltcuong.flashy_be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findAllByUser(User user);
    List<Quiz> findAllByFlashcardSet(FlashcardSet flashcardSet);
    long countByUser(User user);

    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.user = :user AND q.score = q.totalQuestion")
    long countPerfectQuizzes(User user);

    @Query("SELECT COALESCE(SUM(q.score), 0) FROM Quiz q WHERE q.user = :user")
    long sumCorrectAnswers(User user);

    @Query("SELECT COALESCE(SUM(q.totalQuestion), 0) FROM Quiz q WHERE q.user = :user")
    long sumTotalQuestions(User user);

    List<Quiz> findAllByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.createdAt >= :since")
    long countNewQuizzesSince(@org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);

    @Query("SELECT q FROM Quiz q WHERE q.user = :user AND q.createdAt >= :since ORDER BY q.createdAt ASC")
    List<Quiz> findByUserAndCreatedAtAfter(User user, java.time.LocalDateTime since);
}
