package com.yealch.yealch.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ProjectRepository extends PagingAndSortingRepository<Project, UUID>, CrudRepository<Project, UUID> {
    @Query("SELECT p FROM Project p JOIN p.organization o JOIN o.memberships m WHERE m.user.id = :userId")
    Page<Project> findByUserId(@Param("userId") UUID userId, Pageable pageable);
}
