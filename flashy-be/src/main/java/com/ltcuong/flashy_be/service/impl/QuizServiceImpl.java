package com.ltcuong.flashy_be.service.impl;

import com.ltcuong.flashy_be.dto.request.QuizAnswerRequest;
import com.ltcuong.flashy_be.dto.request.QuizRequest;
import com.ltcuong.flashy_be.dto.response.QuizAnswerResponse;
import com.ltcuong.flashy_be.dto.response.QuizResponse;
import com.ltcuong.flashy_be.entity.*;
import com.ltcuong.flashy_be.exception.AppException;
import com.ltcuong.flashy_be.exception.ErrorCode;
import com.ltcuong.flashy_be.repository.*;
import com.ltcuong.flashy_be.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private QuizAnswerResponse toAnswerResponse(QuizAnswer answer) {
        return QuizAnswerResponse.builder()
                .id(answer.getId())
                .flashcardId(answer.getFlashcard().getId())
                .term(answer.getFlashcard().getTerm())
                .correctAnswer(answer.getFlashcard().getDefinition())
                .userAnswer(answer.getUserAnswer())
                .isCorrect(answer.getIsCorrect())
                .build();
    }

    private QuizResponse toQuizResponse(Quiz quiz) {
        List<QuizAnswerResponse> answers = quiz.getQuizAnswers() != null
                ? quiz.getQuizAnswers().stream().map(this::toAnswerResponse).collect(Collectors.toList())
                : List.of();

        return QuizResponse.builder()
                .id(quiz.getId())
                .setId(quiz.getFlashcardSet().getId())
                .setTitle(quiz.getFlashcardSet().getTitle())
                .score(quiz.getScore())
                .totalQuestion(quiz.getTotalQuestion())
                .createdAt(quiz.getCreatedAt())
                .answers(answers)
                .build();
    }

    @Override
    @Transactional
    public QuizResponse submitQuiz(Long setId, QuizRequest request) {
        User user = getCurrentUser();
        FlashcardSet flashcardSet = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));

        if (!flashcardSet.getUser().getId().equals(user.getId()) && !"public".equals(flashcardSet.getVisibility())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        Quiz quiz = Quiz.builder()
                .user(user)
                .flashcardSet(flashcardSet)
                .totalQuestion(request.getAnswers().size())
                .score(0)
                .createdAt(LocalDateTime.now())
                .build();

        Quiz savedQuiz = quizRepository.save(quiz);

        int correctCount = 0;
        for (QuizAnswerRequest answerRequest : request.getAnswers()) {
            Flashcard flashcard = flashcardRepository.findById(answerRequest.getFlashcardId())
                    .orElseThrow(() -> new AppException(ErrorCode.FLASHCARD_NOT_FOUND));

            boolean isCorrect = flashcard.getDefinition().trim()
                    .equalsIgnoreCase(answerRequest.getUserAnswer().trim());

            if (isCorrect) correctCount++;

            QuizAnswer quizAnswer = QuizAnswer.builder()
                    .quiz(savedQuiz)
                    .flashcard(flashcard)
                    .userAnswer(answerRequest.getUserAnswer())
                    .isCorrect(isCorrect)
                    .build();

            quizAnswerRepository.save(quizAnswer);
        }

        savedQuiz.setScore(correctCount);
        quizRepository.save(savedQuiz);

        return toQuizResponse(quizRepository.findById(savedQuiz.getId()).orElseThrow());
    }

    @Override
    public List<QuizResponse> getMyQuizzes() {
        User user = getCurrentUser();
        return quizRepository.findAllByUser(user).stream()
                .map(this::toQuizResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuizResponse> getQuizzesBySet(Long setId) {
        User user = getCurrentUser();
        FlashcardSet flashcardSet = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new AppException(ErrorCode.SET_NOT_FOUND));

        if (!flashcardSet.getUser().getId().equals(user.getId()) && !"public".equals(flashcardSet.getVisibility())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        return quizRepository.findAllByFlashcardSet(flashcardSet).stream()
                .map(this::toQuizResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QuizResponse getQuizById(Long id) {
        User user = getCurrentUser();
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));

        if (!quiz.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        return toQuizResponse(quiz);
    }

    @Override
    public void deleteQuiz(Long id) {
        User user = getCurrentUser();
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_NOT_FOUND));

        if (!quiz.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_RESOURCE);
        }

        quizRepository.delete(quiz);
    }
}