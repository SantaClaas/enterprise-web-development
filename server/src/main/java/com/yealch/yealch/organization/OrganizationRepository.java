package com.yealch.yealch.organization;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface OrganizationRepository extends PagingAndSortingRepository<Organization, UUID>, CrudRepository<Organization, UUID> {
    @Query("SELECT o FROM Organization o JOIN o.memberships m WHERE m.user.id = :userId")
    Page<Organization> findByUserId(@Param("userId") UUID userId, Pageable pageable);
}
