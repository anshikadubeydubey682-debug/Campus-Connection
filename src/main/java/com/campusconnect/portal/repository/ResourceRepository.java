package com.campusconnect.portal.repository;

import com.campusconnect.portal.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
}
