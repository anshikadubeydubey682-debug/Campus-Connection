package com.campusconnect.portal.repository;

import com.campusconnect.portal.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findBySemesterOrderByUploadDateDesc(Integer semester);
}
