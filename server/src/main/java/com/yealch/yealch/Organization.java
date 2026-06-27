package com.yealch.yealch;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "organizations")
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrganizationMembership> memberships = new HashSet<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Project> projects = new HashSet<>();

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<OrganizationMembership> getMemberships() {
        return memberships;
    }

    public Set<User> getMembers() {
        return memberships.stream().map(OrganizationMembership::getUser).collect(Collectors.toSet());
    }

    public void addMember(User user, OrganizationRole role) {
        OrganizationMembership membership = new OrganizationMembership(this, user, role);
        memberships.add(membership);
        user.getMemberships().add(membership);
    }

    public void removeMember(User user) {
        memberships.removeIf(membership -> user.getId().equals(membership.getUser().getId()));
        user.getMemberships().removeIf(membership -> this.getId().equals(membership.getOrganization().getId()));
    }

    public boolean hasMember(UUID userId) {
        return memberships.stream().anyMatch(membership -> userId.equals(membership.getUser().getId()));
    }

    public boolean hasMemberWithRole(UUID userId, OrganizationRole... roles) {
        Set<OrganizationRole> allowedRoles = new HashSet<>(Arrays.asList(roles));
        return memberships.stream().anyMatch(membership ->
                userId.equals(membership.getUser().getId()) && allowedRoles.contains(membership.getRole()));
    }

    public Set<Project> getProjects() {
        return projects;
    }

    public void addProject(Project project) {
        projects.add(project);
        project.setOrganization(this);
    }
}
