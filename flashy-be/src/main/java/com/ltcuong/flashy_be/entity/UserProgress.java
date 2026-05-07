package com.ltcuong.flashy_be.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "correct_count")
    private Integer correctCount;

    @Column(name = "last_reviewed")
    private LocalDateTime lastReviewed;

    @Column(name = "next_review")
    private LocalDateTime nextReview;

    // SM-2 algorithm fields
    @Column(name = "repetition")
    private Integer repetition;      // số lần ôn tập thành công liên tiếp

    @Column(name = "ease_factor")
    private Double easeFactor;       // hệ số khó (mặc định 2.5)

    @Column(name = "interval_days")
    private Integer intervalDays;    // số ngày đến lần ôn tiếp theo

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-progress")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flashcard_id", nullable = false)
    @JsonBackReference("flashcard-progress")
    private Flashcard flashcard;
}