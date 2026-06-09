package com.yealch.yealch;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "project")
    private List<Time> times = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "organization_id", insertable = false, updatable = false)
    private Long organizationId;

    public void setName(String name) {
        this.name = name;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
