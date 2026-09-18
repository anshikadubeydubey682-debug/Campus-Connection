package com.campusconnect.portal.dto;

import com.campusconnect.portal.model.AccountStatus;
import com.campusconnect.portal.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthResponse DTO — Returned to client after successful login
 *
 * Sent from POST /api/auth/login on success.
 * Contains JWT token + user profile info to display in the frontend.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    /** JWT Bearer token — client stores this and sends in Authorization header */
    private String token;

    /** Token type — always "Bearer" */
    @Builder.Default
    private String tokenType = "Bearer";

    /** Logged-in user details */
    private Long userId;
    private String fullName;
    private String email;
    private Role role;
    private AccountStatus status;
    private String department;
    private String section;
}
