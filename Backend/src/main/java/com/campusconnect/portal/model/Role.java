package com.campusconnect.portal.model;

/**
 * Role Enum — Defines the 3 user roles in CampusConnect
 *
 * ADMIN   — System Administrator: Manages all users, approves Faculty and Student registrations
 * FACULTY — Teaching Staff: Approves student registrations, publishes notices, marks attendance
 * STUDENT — Student: Accesses notices, attendance, events, doubts, complaints after approval
 */
public enum Role {
    ADMIN,
    FACULTY,
    STUDENT
}
