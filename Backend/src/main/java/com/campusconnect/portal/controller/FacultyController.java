package com.campusconnect.portal.controller;

import com.campusconnect.portal.dto.ApprovalRequest;
import com.campusconnect.portal.model.Role;
import com.campusconnect.portal.model.User;
import com.campusconnect.portal.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    @Autowired
    private UserService userService;

    @GetMapping("/pending-students")
    public ResponseEntity<List<User>> getPendingStudents(@AuthenticationPrincipal User facultyUser) {
        // Option 1: Faculty can only see students in their own department
        List<User> pendingStudents = userService.getPendingUsersByRole(Role.STUDENT).stream()
                .filter(u -> u.getDepartment().equals(facultyUser.getDepartment()))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(pendingStudents);
    }

    @PutMapping("/students/{userId}/status")
    public ResponseEntity<?> approveStudentStatus(
            @PathVariable Long userId,
            @Valid @RequestBody ApprovalRequest request,
            @AuthenticationPrincipal User facultyUser) {

        try {
            // Note: In a production app, you'd add a check to ensure the faculty is 
            // only approving students in their own department.
            String message = userService.approveUser(userId, request, facultyUser.getId());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
