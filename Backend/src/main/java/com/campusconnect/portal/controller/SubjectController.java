package com.campusconnect.portal.controller;

import com.campusconnect.portal.model.Subject;
import com.campusconnect.portal.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @PostMapping("/admin/add")
    public ResponseEntity<?> addSubject(@RequestParam("name") String name, 
                                        @RequestParam("semester") Integer semester) {
        try {
            Subject subject = subjectService.addSubject(name, semester);
            return ResponseEntity.ok(subject);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/semester/{semester}")
    public ResponseEntity<List<Subject>> getSubjectsBySemester(@PathVariable Integer semester) {
        return ResponseEntity.ok(subjectService.getSubjectsBySemester(semester));
    }
}
