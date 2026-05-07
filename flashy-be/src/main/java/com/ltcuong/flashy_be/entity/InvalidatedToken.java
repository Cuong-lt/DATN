package com.ltcuong.flashy_be.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "invalidated_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvalidatedToken {

    @Id
    @Column(name = "id", length = 36)
    private String id; // JWT ID (jti)

    @Column(name = "expiry_time", nullable = false)
    private Date expiryTime;
}