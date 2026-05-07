package com.ltcuong.flashy_be.repository;

import com.ltcuong.flashy_be.entity.Quiz;
import com.ltcuong.flashy_be.entity.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, Long> {
    List<QuizAnswer> findAllByQuiz(Quiz quiz);
}