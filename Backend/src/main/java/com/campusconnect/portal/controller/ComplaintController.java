package com.campusconnect.portal.controller;

import com.campusconnect.portal.model.Complaint;
import com.campusconnect.portal.model.User;
import com.campusconnect.portal.repository.ComplaintRepository;
import com.campusconnect.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> submitComplaint(@RequestBody Complaint request, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        request.setStudent(user);
        return ResponseEntity.ok(complaintRepository.save(request));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveComplaint(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null || (!"faculty".equals(user.getRole()) && !"admin".equals(user.getRole()))) {
            return ResponseEntity.badRequest().body("Only faculty or admin can resolve complaints");
        }

        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) return ResponseEntity.notFound().build();
        
        complaint.setStatus("RESOLVED");
        return ResponseEntity.ok(complaintRepository.save(complaint));
    }
}
