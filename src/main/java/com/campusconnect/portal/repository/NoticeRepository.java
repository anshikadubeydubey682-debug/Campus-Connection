package com.campusconnect.portal.repository;

import com.campusconnect.portal.model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
}
