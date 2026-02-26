package com.softchaos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_subscribers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Newsletter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 100)
    private String name;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(unique = true, length = 100)
    private String confirmationToken;

    private LocalDateTime confirmedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime subscribedAt;
}
