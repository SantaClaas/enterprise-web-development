package com.yealch.yealch;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationsController {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public OrganizationsController(OrganizationRepository organizationRepository, UserRepository userRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    record CreateOrganizationRequest(String name) {
    }

    @PostMapping
    public ResponseEntity<?> createOrganization(@RequestBody CreateOrganizationRequest request) {
        if (request == null || request.name() == null || request.name().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "name is required"));
        }

        Organization organization = new Organization();
        organization.setName(request.name());
        organizationRepository.save(organization);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(organization));
    }

    @GetMapping("/{organizationId}")
    public ResponseEntity<?> getOrganization(@PathVariable Long organizationId) {
        return organizationRepository.findById(organizationId)
                .<ResponseEntity<?>>map(organization -> ResponseEntity.ok(toResponse(organization)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "organization not found")));
    }

    /**
     * Creates a registration of a user as a member of an organization
     */
    @PostMapping("/{organizationId}/members/registrations")
    public ResponseEntity<?> addMemberToOrganization(@PathVariable Long organizationId, @PathVariable Long userId) {
        // TODO implement roles permissions to disallow any organization member to add
        // or remove members
        Optional<Organization> organizationOptional = organizationRepository.findById(organizationId);
        Optional<User> userOptional = userRepository.findById(userId);

        if (organizationOptional.isEmpty() || userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "organization or user not found"));
        }

        Organization organization = organizationOptional.get();
        User user = userOptional.get();
        organization.addMember(user);
        organizationRepository.save(organization);

        return ResponseEntity.ok(toResponse(organization));
    }

    @DeleteMapping("/{organizationId}/members/{userId}")
    public ResponseEntity<?> removeMemberFromOrganization(@PathVariable Long organizationId,
            @PathVariable Long userId) {
        Optional<Organization> organizationOptional = organizationRepository.findById(organizationId);
        Optional<User> userOptional = userRepository.findById(userId);

        if (organizationOptional.isEmpty() || userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "organization or user not found"));
        }

        Organization organization = organizationOptional.get();
        User user = userOptional.get();
        organization.removeMember(user);
        organizationRepository.save(organization);

        return ResponseEntity.ok(toResponse(organization));
    }

    private Map<String, Object> toUserResponse(User user) {
        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "username", user.getUsername());
    }

    @GetMapping("/{organizationId}/users")
    public ResponseEntity<?> getOrganizationUsers(@PathVariable Long organizationId) {
        return organizationRepository.findById(organizationId)
                .<ResponseEntity<?>>map(organization -> ResponseEntity
                        .ok(organization.getMembers().stream().map(this::toUserResponse).toList()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "organization not found")));
    }

    private Map<String, Object> toResponse(Organization organization) {
        return Map.of(
                "id", organization.getId(),
                "name", organization.getName(),
                "users", organization.getMembers().stream().map(this::toUserResponse).toList());
    }
}