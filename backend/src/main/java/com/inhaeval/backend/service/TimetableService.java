package com.inhaeval.backend.service;

import com.inhaeval.backend.domain.Course;
import com.inhaeval.backend.domain.Member;
import com.inhaeval.backend.domain.SavedTimetable;
import com.inhaeval.backend.repository.CourseRepository;
import com.inhaeval.backend.repository.MemberRepository;
import com.inhaeval.backend.repository.SavedTimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final SavedTimetableRepository savedTimetableRepository;
    private final MemberRepository memberRepository;
    private final CourseRepository courseRepository;

    // 내 시간표 전체 조회 → { cart: [courseId, ...], A: [...], B: [...], C: [...] }
    @Transactional(readOnly = true)
    public Map<String, List<Long>> getTimetable(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        List<SavedTimetable> saved = savedTimetableRepository.findByMemberId(member.getId());

        return saved.stream().collect(
                Collectors.groupingBy(
                        SavedTimetable::getPlanKey,
                        Collectors.mapping(s -> s.getCourse().getId(), Collectors.toList())
                )
        );
    }

    // 특정 planKey 전체 덮어쓰기 저장
    @Transactional
    public void savePlan(String email, String planKey, List<Long> courseIds) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        savedTimetableRepository.deleteByMemberIdAndPlanKey(member.getId(), planKey);

        List<Course> courses = courseRepository.findAllById(courseIds);
        List<SavedTimetable> entries = courses.stream()
                .map(course -> SavedTimetable.builder()
                        .member(member)
                        .course(course)
                        .planKey(planKey)
                        .build())
                .collect(Collectors.toList());

        savedTimetableRepository.saveAll(entries);
    }
}