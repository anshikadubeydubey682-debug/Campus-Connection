package com.campusconnect.portal.service;

import com.campusconnect.portal.dto.ApprovalRequest;
import com.campusconnect.portal.dto.AuthResponse;
import com.campusconnect.portal.dto.LoginRequest;
import com.campusconnect.portal.dto.RegisterRequest;
import com.campusconnect.portal.model.AccountStatus;
import com.campusconnect.portal.model.Role;
import com.campusconnect.portal.model.User;
import com.campusconnect.portal.repository.UserRepository;
import com.campusconnect.portal.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public String registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email Address already in use!");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .department(request.getDepartment())
                .idCode(request.getIdCode())
                .section(request.getSection())
                .semester(request.getSemester())
                // Admin accounts are auto-approved in PrePersist, others are PENDING
                .status(request.getRole() == Role.ADMIN ? AccountStatus.APPROVED : AccountStatus.PENDING)
                .build();

        userRepository.save(user);

        return "User registered successfully! Please wait for approval.";
    }

    public AuthResponse authenticateUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();

        if (user.getStatus() != AccountStatus.APPROVED) {
            throw new RuntimeException("Account is not approved yet. Current status: " + user.getStatus());
        }

        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .department(user.getDepartment())
                .section(user.getSection())
                .build();
    }

    @Transactional
    public String approveUser(Long targetUserId, ApprovalRequest request, Long approverId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(request.getNewStatus());
        user.setApprovedById(approverId);
        user.setApprovedAt(LocalDateTime.now());

        userRepository.save(user);

        return "User " + user.getFullName() + " has been " + request.getNewStatus();
    }

    public List<User> getPendingUsersByRole(Role role) {
        return userRepository.findByRoleAndStatus(role, AccountStatus.PENDING);
    }
}
