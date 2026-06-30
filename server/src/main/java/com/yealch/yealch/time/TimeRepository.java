package com.yealch.yealch.time;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface TimeRepository extends PagingAndSortingRepository<Time, UUID>, CrudRepository<Time, UUID> {
    @Query("SELECT t FROM Time t JOIN t.project p JOIN p.organization o JOIN o.memberships m WHERE m.user.id = :userId")
    Page<Time> findByUserId(@Param("userId") UUID userId, Pageable pageable);
}
