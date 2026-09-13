package com.campusconnect.portal.controller;

import com.campusconnect.portal.model.Resource;
import com.campusconnect.portal.model.User;
import com.campusconnect.portal.repository.ResourceRepository;
import com.campusconnect.portal.repository.UserRepository;
import com.campusconnect.portal.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ResourceController {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(resourceRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> uploadResource(
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam(value = "link", required = false) String link,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) {
            
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null || !"faculty".equals(user.getRole())) {
            return ResponseEntity.badRequest().body("Only faculty can upload resources");
        }

        Resource resource = new Resource();
        resource.setTitle(title);
        resource.setCategory(category);
        resource.setFaculty(user);

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            resource.setLink("/uploads/" + fileName);
        } else if (link != null && !link.isEmpty()) {
            resource.setLink(link);
        } else {
            return ResponseEntity.badRequest().body("You must provide either a file or a link");
        }
        
        return ResponseEntity.ok(resourceRepository.save(resource));
    }
}
