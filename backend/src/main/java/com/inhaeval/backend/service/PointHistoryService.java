package com.inhaeval.backend.service;

import com.inhaeval.backend.domain.Member;
import com.inhaeval.backend.dto.PointHistoryResponse;
import com.inhaeval.backend.repository.MemberRepository;
import com.inhaeval.backend.repository.PointHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PointHistoryService {

    private final PointHistoryRepository pointHistoryRepository;
    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<PointHistoryResponse> getMyPointHistory(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        return pointHistoryRepository.findByMemberIdOrderByCreatedAtDesc(member.getId())
                .stream()
                .map(PointHistoryResponse::from)
                .toList();
    }
}