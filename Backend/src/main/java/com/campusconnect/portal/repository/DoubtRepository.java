package com.campusconnect.portal.repository;

import com.campusconnect.portal.model.Doubt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoubtRepository extends JpaRepository<Doubt, Long> {
}
