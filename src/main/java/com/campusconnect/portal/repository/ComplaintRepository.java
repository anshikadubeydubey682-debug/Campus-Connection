package com.campusconnect.portal.repository;

import com.campusconnect.portal.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
}
