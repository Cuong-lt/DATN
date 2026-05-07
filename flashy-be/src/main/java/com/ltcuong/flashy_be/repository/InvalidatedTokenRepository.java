package com.ltcuong.flashy_be.repository;

import com.ltcuong.flashy_be.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {

    // Dọn dẹp các token đã hết hạn khỏi DB
    @Modifying
    @Transactional
    @Query("DELETE FROM InvalidatedToken t WHERE t.expiryTime < :now")
    void deleteAllExpiredBefore(Date now);
}