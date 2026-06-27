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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationsController {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public OrganizationsController(OrganizationRepository organizationRepository, UserRepository userRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    record ErrorResponse(String error) {}

    record PostOrganizationsRequest(String name) {}

    record GetOrganizationsMemberResponse(UUID id, String name, String username) {}
    record GetOrganizationsResponse(UUID id, String name, List<GetOrganizationsMemberResponse> users) {}

    record GetOrganizationsUsersResponse(UUID id, String name, String username) {}

    @PostMapping
    public ResponseEntity<?> createOrganization(@RequestBody PostOrganizationsRequest request,
            Authentication authentication) {
        UUID authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (request == null || request.name() == null || request.name().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("name is required"));
        }

        Organization organization = new Organization();
        organization.setName(request.name());
        organizationRepository.save(organization);

        return ResponseEntity.status(HttpStatus.CREATED).body(toGetOrganizationsResponse(organization));
    }

    @GetMapping("/{organizationId}")
    public ResponseEntity<?> getOrganization(@PathVariable UUID organizationId, Authentication authentication) {
        UUID authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return organizationRepository.findById(organizationId)
                .<ResponseEntity<?>>map(organization -> {
                    if (!organization.hasMember(authenticatedUserId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    return ResponseEntity.ok(toGetOrganizationsResponse(organization));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("organization not found")));
    }

    /**
     * Creates a registration of a user as a member of an organization.
     * Requires the authenticated user to be an administrator or owner of the organization.
     */
    @PostMapping("/{organizationId}/members/registrations")
    public ResponseEntity<?> addMemberToOrganization(@PathVariable UUID organizationId, @PathVariable UUID userId,
            Authentication authentication) {
        UUID authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Organization> foundOrganization = organizationRepository.findById(organizationId);
        Optional<User> foundUser = userRepository.findById(userId);

        if (foundOrganization.isEmpty() || foundUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("organization or user not found"));
        }

        Organization organization = foundOrganization.get();
        if (!organization.hasMemberWithRole(authenticatedUserId, OrganizationRole.ADMINISTRATOR, OrganizationRole.OWNER)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        organization.addMember(foundUser.get(), OrganizationRole.MEMBER);
        organizationRepository.save(organization);

        return ResponseEntity.ok(toGetOrganizationsResponse(organization));
    }

    /**
     * Requires the authenticated user to be an administrator or owner of the organization.
     */
    @DeleteMapping("/{organizationId}/members/{userId}")
    public ResponseEntity<?> removeMemberFromOrganization(@PathVariable UUID organizationId,
            @PathVariable UUID userId, Authentication authentication) {
        UUID authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Organization> foundOrganization = organizationRepository.findById(organizationId);
        Optional<User> foundUser = userRepository.findById(userId);

        if (foundOrganization.isEmpty() || foundUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("organization or user not found"));
        }

        Organization organization = foundOrganization.get();
        if (!organization.hasMemberWithRole(authenticatedUserId, OrganizationRole.ADMINISTRATOR, OrganizationRole.OWNER)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        organization.removeMember(foundUser.get());
        organizationRepository.save(organization);

        return ResponseEntity.ok(toGetOrganizationsResponse(organization));
    }

    @DeleteMapping("/{organizationId}")
    public ResponseEntity<?> deleteOrganization(@PathVariable UUID organizationId, Authentication authentication) {
        UUID authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Organization> foundOrganization = organizationRepository.findById(organizationId);
        if (foundOrganization.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("organization not found"));
        }

        Organization organization = foundOrganization.get();
        if (!organization.hasMemberWithRole(authenticatedUserId, OrganizationRole.OWNER)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        organizationRepository.delete(organization);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{organizationId}/users")
    public ResponseEntity<?> getOrganizationUsers(@PathVariable UUID organizationId, Authentication authentication) {
        UUID authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return organizationRepository.findById(organizationId)
                .<ResponseEntity<?>>map(organization -> {
                    if (!organization.hasMember(authenticatedUserId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    return ResponseEntity.ok(organization.getMembers().stream()
                            .map(OrganizationsController::toGetOrganizationsUsersResponse)
                            .toList());
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("organization not found")));
    }

    private static GetOrganizationsMemberResponse toGetOrganizationsMemberResponse(User user) {
        return new GetOrganizationsMemberResponse(user.getId(), user.getName(), user.getUsername());
    }

    private static GetOrganizationsResponse toGetOrganizationsResponse(Organization organization) {
        return new GetOrganizationsResponse(
                organization.getId(),
                organization.getName(),
                organization.getMembers().stream().map(OrganizationsController::toGetOrganizationsMemberResponse).toList());
    }

    private static GetOrganizationsUsersResponse toGetOrganizationsUsersResponse(User user) {
        return new GetOrganizationsUsersResponse(user.getId(), user.getName(), user.getUsername());
    }
}
