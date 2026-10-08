package com.campusconnect.portal.controller;

import com.campusconnect.portal.dto.MarkAttendanceRequest;
import com.campusconnect.portal.model.Attendance;
import com.campusconnect.portal.model.User;
import com.campusconnect.portal.repository.AttendanceRepository;
import com.campusconnect.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    // Faculty marking attendance for a student
    @PostMapping("/mark")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<?> markAttendance(@RequestBody MarkAttendanceRequest request, Authentication authentication) {
        String markerEmail = authentication.getName();
        User marker = userRepository.findByEmail(markerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if attendance already marked
        Optional<Attendance> existing = attendanceRepository.findByStudentIdAndSubjectAndDate(
                student.getId(), request.getSubject(), request.getDate());

        Attendance attendance;
        if (existing.isPresent()) {
            attendance = existing.get();
            attendance.setStatus(request.getStatus());
            attendance.setMarkedBy(marker);
        } else {
            attendance = Attendance.builder()
                    .student(student)
                    .subject(request.getSubject())
                    .date(request.getDate())
                    .status(request.getStatus())
                    .markedBy(marker)
                    .build();
        }

        attendanceRepository.save(attendance);
        return ResponseEntity.ok("Attendance marked successfully");
    }

    // Get attendance for a specific student (Student views their own, or Faculty views it)
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable Long studentId) {
        List<Attendance> records = attendanceRepository.findByStudentId(studentId);
        return ResponseEntity.ok(records);
    }

    // Get attendance for a specific student within a date range (for graph generation)
    @GetMapping("/student/{studentId}/graph")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<List<Attendance>> getStudentAttendanceGraph(
            @PathVariable Long studentId,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Attendance> records = attendanceRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate);
        return ResponseEntity.ok(records);
    }
}
