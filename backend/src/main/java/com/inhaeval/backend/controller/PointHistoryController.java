package com.inhaeval.backend.controller;

import com.inhaeval.backend.dto.PointHistoryResponse;
import com.inhaeval.backend.service.PointHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/points")
@RequiredArgsConstructor
public class PointHistoryController {

    private final PointHistoryService pointHistoryService;

    // 내 포인트 내역 조회 (마이페이지용)
    @GetMapping("/history")
    public ResponseEntity<List<PointHistoryResponse>> getMyPointHistory(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(pointHistoryService.getMyPointHistory(email));
    }
} 