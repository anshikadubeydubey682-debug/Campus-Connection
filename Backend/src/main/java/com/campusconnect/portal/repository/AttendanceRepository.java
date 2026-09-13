package com.campusconnect.portal.repository;

import com.campusconnect.portal.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    List<Attendance> findByStudentId(Long studentId);
    
    List<Attendance> findByStudentIdAndSubject(Long studentId, String subject);
    
    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
    
    Optional<Attendance> findByStudentIdAndSubjectAndDate(Long studentId, String subject, LocalDate date);
    
    List<Attendance> findBySubjectAndDate(String subject, LocalDate date);
}
