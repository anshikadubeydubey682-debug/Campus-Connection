package com.campusconnect.portal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * LoginRequest DTO — Data Transfer Object for user login requests
 *
 * Sent from frontend login form to POST /api/auth/login
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
