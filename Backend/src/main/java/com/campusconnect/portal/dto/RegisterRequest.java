package com.campusconnect.portal.dto;

import com.campusconnect.portal.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * RegisterRequest DTO — Data Transfer Object for user registration requests
 *
 * Sent from frontend (Student / Faculty registration form) to POST /api/auth/register
 * Contains all information needed to create a new user account with PENDING status.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required (STUDENT or FACULTY)")
    private Role role;

    @NotBlank(message = "Department is required")
    private String department;

    /** Roll Number for Students, Employee ID for Faculty */
    private String idCode;

    /** Year & Section for Students (optional for Faculty) */
    private String section;
}
