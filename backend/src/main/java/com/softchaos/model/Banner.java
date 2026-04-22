package com.softchaos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 320)
    private String subtitle;

    @Column(length = 60)
    private String buttonLabel;

    @Column(length = 1000)
    private String targetUrl;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(nullable = false, length = 500)
    private String imageFilename;

    @Column(length = 255)
    private String imageAltText;

    @Column(nullable = false)
    private Integer displayOrder = 1;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
