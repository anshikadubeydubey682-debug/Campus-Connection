package com.campusconnect.portal.service;

import com.campusconnect.portal.model.Subject;
import com.campusconnect.portal.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    public Subject addSubject(String name, Integer semester) {
        if (subjectRepository.existsByNameAndSemester(name, semester)) {
            throw new RuntimeException("Subject already exists for this semester");
        }
        Subject subject = new Subject();
        subject.setName(name);
        subject.setSemester(semester);
        return subjectRepository.save(subject);
    }

    public List<Subject> getSubjectsBySemester(Integer semester) {
        return subjectRepository.findBySemesterOrderByNameAsc(semester);
    }
}
