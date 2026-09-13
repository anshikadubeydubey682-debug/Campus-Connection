package com.campusconnect.portal.repository;

import com.campusconnect.portal.model.AccountStatus;
import com.campusconnect.portal.model.Role;
import com.campusconnect.portal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository — Spring Data JPA interface for User database operations
 *
 * Spring Data JPA auto-generates SQL queries based on method names.
 * No manual SQL needed!
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Find user by email (used during login authentication) */
    Optional<User> findByEmail(String email);

    /** Check if email already registered (used during registration validation) */
    boolean existsByEmail(String email);

    /** Get all users with a specific role */
    List<User> findByRole(Role role);

    /** Get all users by account status (e.g., all PENDING registrations) */
    List<User> findByStatus(AccountStatus status);

    /** Get all users with specific role AND status (e.g., PENDING FACULTY accounts) */
    List<User> findByRoleAndStatus(Role role, AccountStatus status);

    /** Get all users in a specific department */
    List<User> findByDepartment(String department);

    /** Get all users with specific role in a department */
    List<User> findByRoleAndDepartment(Role role, String department);

    /** Count approved users per role (used in Admin dashboard metrics) */
    long countByRoleAndStatus(Role role, AccountStatus status);
}
