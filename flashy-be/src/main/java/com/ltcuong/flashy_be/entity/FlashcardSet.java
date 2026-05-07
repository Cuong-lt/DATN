package com.ltcuong.flashy_be.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "flashcard_set")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "visibility")
    private String visibility;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-flashcardSets")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    @JsonBackReference("folder-flashcardSets")
    private Folder folder;

    @OneToMany(mappedBy = "flashcardSet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("set-flashcards")
    private List<Flashcard> flashcards;

    @OneToMany(mappedBy = "flashcardSet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("set-quizzes")
    private List<Quiz> quizzes;

    @OneToMany(mappedBy = "flashcardSet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("set-favoriteSets")
    private List<FavoriteSet> favoriteSets;
}