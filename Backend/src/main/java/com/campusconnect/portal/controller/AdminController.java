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

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/pending-faculty")
    public ResponseEntity<List<User>> getPendingFaculty() {
        return ResponseEntity.ok(userService.getPendingUsersByRole(Role.FACULTY));
    }

    @GetMapping("/pending-students")
    public ResponseEntity<List<User>> getPendingStudents() {
        return ResponseEntity.ok(userService.getPendingUsersByRole(Role.STUDENT));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> approveUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody ApprovalRequest request,
            @AuthenticationPrincipal User adminUser) {
        
        try {
            String message = userService.approveUser(userId, request, adminUser.getId());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
