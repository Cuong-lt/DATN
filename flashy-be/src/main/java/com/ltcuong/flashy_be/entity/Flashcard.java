package com.ltcuong.flashy_be.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "flashcard")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "term")
    private String term;

    @Column(name = "definition", columnDefinition = "TEXT")
    private String definition;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id", nullable = false)
    @JsonBackReference("set-flashcards")
    private FlashcardSet flashcardSet;

    @OneToMany(mappedBy = "flashcard", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("flashcard-quizAnswers")
    private List<QuizAnswer> quizAnswers;

    @OneToMany(mappedBy = "flashcard", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("flashcard-progress")
    private List<UserProgress> userProgressList;
}