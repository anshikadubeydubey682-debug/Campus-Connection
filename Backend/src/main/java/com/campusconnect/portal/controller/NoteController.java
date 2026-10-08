package com.campusconnect.portal.controller;

import com.campusconnect.portal.model.Note;
import com.campusconnect.portal.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*") 
public class NoteController {

    @Autowired
    private NoteService noteService;

    @PostMapping("/admin/upload")
    public ResponseEntity<Note> uploadNote(@RequestParam("file") MultipartFile file,
                                           @RequestParam("title") String title,
                                           @RequestParam("subject") String subject,
                                           @RequestParam("semester") Integer semester) {
        Note note = noteService.storeFile(file, title, subject, semester);
        return ResponseEntity.ok(note);
    }

    @GetMapping("/semester/{semester}")
    public ResponseEntity<List<Note>> getNotesBySemester(@PathVariable Integer semester) {
        List<Note> notes = noteService.getNotesBySemester(semester);
        return ResponseEntity.ok(notes);
    }
}
