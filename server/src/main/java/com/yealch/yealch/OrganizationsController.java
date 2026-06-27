package com.yealch.yealch;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity<?> createOrganization(@RequestBody CreateOrganizationRequest request,
            Authentication authentication) {
        Long authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (request == null || request.name() == null || request.name().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "name is required"));
        }

        Organization organization = new Organization();
        organization.setName(request.name());
        organizationRepository.save(organization);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(organization));
    }

    @GetMapping("/{organizationId}")
    public ResponseEntity<?> getOrganization(@PathVariable Long organizationId, Authentication authentication) {
        Long authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return organizationRepository.findById(organizationId)
                .<ResponseEntity<?>>map(organization -> {
                    if (!isMember(organization, authenticatedUserId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    return ResponseEntity.ok(toResponse(organization));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "organization not found")));
    }

    /**
     * Creates a registration of a user as a member of an organization
     */
    @PostMapping("/{organizationId}/members/registrations")
    public ResponseEntity<?> addMemberToOrganization(@PathVariable Long organizationId, @PathVariable Long userId,
            Authentication authentication) {
        Long authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Organization> organizationOptional = organizationRepository.findById(organizationId);
        Optional<User> userOptional = userRepository.findById(userId);

        if (organizationOptional.isEmpty() || userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "organization or user not found"));
        }

        Organization organization = organizationOptional.get();
        if (!isMember(organization, authenticatedUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        User user = userOptional.get();
        organization.addMember(user);
        organizationRepository.save(organization);

        return ResponseEntity.ok(toResponse(organization));
    }

    @DeleteMapping("/{organizationId}/members/{userId}")
    public ResponseEntity<?> removeMemberFromOrganization(@PathVariable Long organizationId,
            @PathVariable Long userId, Authentication authentication) {
        Long authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Organization> organizationOptional = organizationRepository.findById(organizationId);
        Optional<User> userOptional = userRepository.findById(userId);

        if (organizationOptional.isEmpty() || userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "organization or user not found"));
        }

        Organization organization = organizationOptional.get();
        if (!isMember(organization, authenticatedUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        User user = userOptional.get();
        organization.removeMember(user);
        organizationRepository.save(organization);

        return ResponseEntity.ok(toResponse(organization));
    }

    @DeleteMapping("/{organizationId}")
    public ResponseEntity<?> deleteOrganization(@PathVariable Long organizationId, Authentication authentication) {
        Long authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Organization> organizationOptional = organizationRepository.findById(organizationId);
        if (organizationOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "organization not found"));
        }

        Organization organization = organizationOptional.get();
        if (!isMember(organization, authenticatedUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        organizationRepository.delete(organization);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toUserResponse(User user) {
        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "username", user.getUsername());
    }

    @GetMapping("/{organizationId}/users")
    public ResponseEntity<?> getOrganizationUsers(@PathVariable Long organizationId, Authentication authentication) {
        Long authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return organizationRepository.findById(organizationId)
                .<ResponseEntity<?>>map(organization -> {
                    if (!isMember(organization, authenticatedUserId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    return ResponseEntity.ok(organization.getMembers().stream().map(this::toUserResponse).toList());
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "organization not found")));
    }

    private boolean isMember(Organization organization, Long userId) {
        return organization.getMembers().stream().anyMatch(member -> userId.equals(member.getId()));
    }

    private Map<String, Object> toResponse(Organization organization) {
        return Map.of(
                "id", organization.getId(),
                "name", organization.getName(),
                "users", organization.getMembers().stream().map(this::toUserResponse).toList());
    }
}
