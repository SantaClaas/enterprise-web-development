package com.yealch.yealch;

import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface TimeRepository extends CrudRepository<Time, UUID> {
}
