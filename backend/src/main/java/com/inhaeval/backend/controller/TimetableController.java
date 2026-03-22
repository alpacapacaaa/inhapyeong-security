package com.inhaeval.backend.controller;

import com.inhaeval.backend.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    // 내 시간표 전체 조회
    @GetMapping
    public ResponseEntity<Map<String, List<Long>>> getTimetable(Authentication authentication) {
        return ResponseEntity.ok(timetableService.getTimetable(authentication.getName()));
    }

    // 특정 planKey 저장 (덮어쓰기)
    // planKey: "cart" / "A" / "B" / "C"
    @PutMapping("/{planKey}")
    public ResponseEntity<Void> savePlan(
            @PathVariable String planKey,
            @RequestBody List<Long> courseIds,
            Authentication authentication) {
        timetableService.savePlan(authentication.getName(), planKey, courseIds);
        return ResponseEntity.ok().build();
    }
}