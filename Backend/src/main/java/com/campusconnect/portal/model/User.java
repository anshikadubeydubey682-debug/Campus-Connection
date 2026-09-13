package com.campusconnect.portal.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * User Entity — Maps to the `users` table in MySQL database
 *
 * Implements UserDetails for Spring Security integration.
 * Stores student, faculty, and admin account information.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AccountStatus status = AccountStatus.PENDING;

    @Column(nullable = false)
    private String department;

    /**
     * University Roll Number for Students, Employee ID for Faculty
     */
    @Column
    private String idCode;

    /**
     * Section / Year for Students (e.g. "3rd Year - Sec A"), N/A for Faculty
     */
    @Column
    private String section;

    /**
     * Admin/Faculty who approved this account (nullable until approved)
     */
    @Column
    private Long approvedById;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        // Admin accounts are auto-approved on creation
        if (this.role == Role.ADMIN) {
            this.status = AccountStatus.APPROVED;
        }
    }

    // ---- Spring Security UserDetails Implementation ----

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Account is locked until APPROVED
        return this.status == AccountStatus.APPROVED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.status == AccountStatus.APPROVED;
    }
}
