package com.campusconnect.portal.model;

/**
 * AccountStatus Enum — Represents registration approval state of a user
 *
 * PENDING  — User registered but not yet approved (default state after self-registration)
 * APPROVED — User approved by Admin (for Faculty) or Admin/Faculty (for Students). Can log in.
 * REJECTED — Registration request rejected. Cannot log in.
 */
public enum AccountStatus {
    PENDING,
    APPROVED,
    REJECTED
}
