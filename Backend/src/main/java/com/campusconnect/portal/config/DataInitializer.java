package com.campusconnect.portal.config;

import com.campusconnect.portal.model.AccountStatus;
import com.campusconnect.portal.model.Role;
import com.campusconnect.portal.model.User;
import com.campusconnect.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${spring.security.user.name}")
    private String defaultAdminEmail;

    @Value("${spring.security.user.password}")
    private String defaultAdminPassword;

    @Override
    public void run(String... args) throws Exception {
        
        System.out.println("Checking for default accounts...");

        // 1. Create Default Admin
        if (!userRepository.existsByEmail(defaultAdminEmail)) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .email(defaultAdminEmail)
                    .password(passwordEncoder.encode(defaultAdminPassword))
                    .role(Role.ADMIN)
                    .department("Administration")
                    .status(AccountStatus.APPROVED)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(admin);
            System.out.println("Default Admin created: " + defaultAdminEmail + " / " + defaultAdminPassword);
        } else {
            System.out.println("Admin account already exists.");
        }

        // 2. Create Default Approved Faculty (for testing)
        if (!userRepository.existsByEmail("faculty@campus.com")) {
            User faculty = User.builder()
                    .fullName("Prof. Rajesh Sharma")
                    .email("faculty@campus.com")
                    .password(passwordEncoder.encode("faculty123"))
                    .role(Role.FACULTY)
                    .department("Computer Science")
                    .idCode("EMP-1001")
                    .status(AccountStatus.APPROVED)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(faculty);
            System.out.println("Test Faculty created: faculty@campus.com / faculty123");
        }

        // 3. Create Default Approved Student (for testing)
        if (!userRepository.existsByEmail("student@campus.com")) {
            User student = User.builder()
                    .fullName("Rahul Kumar")
                    .email("student@campus.com")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.STUDENT)
                    .department("Computer Science")
                    .idCode("STU-2024-001")
                    .section("3rd Year - Sec A")
                    .status(AccountStatus.APPROVED)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(student);
            System.out.println("Test Approved Student created: student@campus.com / student123");
        }

        // 4. Create Default Pending Student (for testing approval flow)
        if (!userRepository.existsByEmail("pending@campus.com")) {
            User pendingStudent = User.builder()
                    .fullName("Sneha Gupta")
                    .email("pending@campus.com")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.STUDENT)
                    .department("Computer Science")
                    .idCode("STU-2024-002")
                    .section("2nd Year - Sec B")
                    .status(AccountStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(pendingStudent);
            System.out.println("Test Pending Student created: pending@campus.com / student123");
        }
    }
}
