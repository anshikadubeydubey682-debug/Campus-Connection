package com.campusconnect.portal.service;

import com.campusconnect.portal.model.Note;
import com.campusconnect.portal.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class NoteService {

    private final Path fileStorageLocation;
    
    @Autowired
    private NoteRepository noteRepository;

    public NoteService() {
        this.fileStorageLocation = Paths.get("uploads/notes").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public Note storeFile(MultipartFile file, String title, String subject, Integer semester) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            if(originalFileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            String fileExtension = "";
            int i = originalFileName.lastIndexOf('.');
            if (i > 0) {
                fileExtension = originalFileName.substring(i);
            }
            String newFileName = UUID.randomUUID().toString() + fileExtension;

            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileDownloadUri = "/uploads/notes/" + newFileName;

            Note note = new Note();
            note.setTitle(title);
            note.setSubject(subject);
            note.setSemester(semester);
            note.setFileName(newFileName);
            note.setFileType(file.getContentType());
            note.setFileUrl(fileDownloadUri);

            return noteRepository.save(note);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }
    
    public List<Note> getNotesBySemester(Integer semester) {
        return noteRepository.findBySemesterOrderByUploadDateDesc(semester);
    }
}
