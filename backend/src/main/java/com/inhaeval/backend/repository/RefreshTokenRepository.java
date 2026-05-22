package com.inhaeval.backend.repository;

import com.inhaeval.backend.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByEmail(String email);
    void deleteByFamilyId(String familyId);

    @Modifying
    @Query("UPDATE RefreshToken t SET t.used = true WHERE t.familyId = :familyId")
    void markAllAsUsedByFamilyId(@Param("familyId") String familyId);
}
