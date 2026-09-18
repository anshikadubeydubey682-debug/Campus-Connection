package com.campusconnect.portal.controller;

import com.campusconnect.portal.model.Notice;
import com.campusconnect.portal.model.User;
import com.campusconnect.portal.repository.NoticeRepository;
import com.campusconnect.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NoticeController {

    @Autowired
    private NoticeRepository noticeRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notice>> getAllNotices() {
        return ResponseEntity.ok(noticeRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createNotice(@RequestBody Notice request, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null || !"faculty".equals(user.getRole())) {
            return ResponseEntity.badRequest().body("Only faculty can create notices");
        }
        
        request.setAuthor(user);
        return ResponseEntity.ok(noticeRepository.save(request));
    }
}
