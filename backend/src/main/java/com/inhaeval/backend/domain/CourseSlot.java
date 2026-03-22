package com.inhaeval.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_slots")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CourseSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String day;         // 월/화/수/목/금

    @Column(nullable = false)
    private int startPeriod;    // 1~14교시

    @Column(nullable = false)
    private int endPeriod;      // 1~14교시

    private String location;    // 강의실 (예: 5호관 301)
}