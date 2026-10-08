package com.campusconnect.portal.repository;

import com.campusconnect.portal.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findBySemesterOrderByNameAsc(Integer semester);
    boolean existsByNameAndSemester(String name, Integer semester);
}
