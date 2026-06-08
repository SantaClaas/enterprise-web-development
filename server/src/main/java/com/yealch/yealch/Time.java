package com.yealch.yealch;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "times")
public class Time {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private OffsetDateTime start;

    @Column(nullable = false)
    private OffsetDateTime end;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Organization project;

    @Column(name = "project_id", insertable = false, updatable = false)
    private Long projectId;
}
