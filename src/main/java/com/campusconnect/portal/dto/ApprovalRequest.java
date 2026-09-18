package com.campusconnect.portal.dto;

import com.campusconnect.portal.model.AccountStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * ApprovalRequest DTO — Used by Admin and Faculty to approve/reject user accounts
 *
 * Sent to PUT /api/admin/users/{userId}/status or PUT /api/faculty/students/{userId}/status
 */
@Data
public class ApprovalRequest {

    @NotNull(message = "New status is required (APPROVED or REJECTED)")
    private AccountStatus newStatus;

    /** Optional: reason for rejection */
    private String remarks;
}
