package com.yealch.yealch.time;

import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface TimeRepository extends CrudRepository<Time, UUID> {
}
