package com.campusconnect.portal.repository;

import com.campusconnect.portal.model.Doubt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoubtRepository extends JpaRepository<Doubt, Long> {
    List<Doubt> findBySemesterOrderByCreatedAtDesc(Integer semester);
}
