package com.campusconnect.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * CampusConnect Portal - Main Spring Boot Application Entry Point
 * RKGITM Campus Portal Backend REST API
 *
 * Roles: ADMIN | FACULTY | STUDENT
 * Features: Role-Based Access, Registration Approval Workflow, JWT Authentication
 */
@SpringBootApplication
public class CampusConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusConnectApplication.class, args);
        System.out.println("====================================================");
        System.out.println("  CampusConnect Portal API Server Started!");
        System.out.println("  RKGITM - Raj Kumar Goel Institute of Technology");
        System.out.println("  API Base URL: http://localhost:8080/api");
        System.out.println("====================================================");
    }
}
