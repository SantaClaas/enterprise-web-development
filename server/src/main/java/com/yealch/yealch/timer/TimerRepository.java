package com.yealch.yealch.timer;

import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface TimerRepository extends CrudRepository<Timer, UUID> {
    Optional<Timer> findByUser_Id(UUID userId);
}
