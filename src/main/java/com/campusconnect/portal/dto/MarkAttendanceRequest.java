package com.campusconnect.portal.dto;

import com.campusconnect.portal.model.AttendanceStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MarkAttendanceRequest {
    private Long studentId;
    private String subject;
    private LocalDate date;
    private AttendanceStatus status;
}
