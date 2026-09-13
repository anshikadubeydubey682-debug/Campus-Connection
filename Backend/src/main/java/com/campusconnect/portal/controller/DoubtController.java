package com.campusconnect.portal.controller;

import com.campusconnect.portal.model.Doubt;
import com.campusconnect.portal.model.DoubtReply;
import com.campusconnect.portal.model.User;
import com.campusconnect.portal.repository.DoubtReplyRepository;
import com.campusconnect.portal.repository.DoubtRepository;
import com.campusconnect.portal.repository.UserRepository;
import com.campusconnect.portal.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/doubts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoubtController {

    @Autowired
    private DoubtRepository doubtRepository;

    @Autowired
    private DoubtReplyRepository doubtReplyRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<Doubt>> getAllDoubts() {
        return ResponseEntity.ok(doubtRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createDoubt(@RequestBody Doubt request, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");
        
        request.setAuthor(user);
        return ResponseEntity.ok(doubtRepository.save(request));
    }

    @PostMapping("/{doubtId}/reply")
    public ResponseEntity<?> replyToDoubt(
            @PathVariable Long doubtId,
            @RequestParam(value = "textExplanation", required = false) String textExplanation,
            @RequestParam(value = "mediaFile", required = false) MultipartFile mediaFile,
            Principal principal) {
            
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");
        
        Doubt doubt = doubtRepository.findById(doubtId).orElse(null);
        if (doubt == null) return ResponseEntity.badRequest().body("Doubt not found");

        DoubtReply reply = new DoubtReply();
        reply.setAuthor(user);
        reply.setDoubt(doubt);
        reply.setTextExplanation(textExplanation);

        if (mediaFile != null && !mediaFile.isEmpty()) {
            String fileName = fileStorageService.storeFile(mediaFile);
            reply.setMediaUrl("/uploads/" + fileName);
            String contentType = mediaFile.getContentType();
            if (contentType != null && contentType.startsWith("video")) {
                reply.setMediaType("VIDEO");
            } else {
                reply.setMediaType("IMAGE");
            }
        }
        
        doubtReplyRepository.save(reply);
        return ResponseEntity.ok(reply);
    }
}
