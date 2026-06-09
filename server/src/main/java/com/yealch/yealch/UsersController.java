package com.yealch.yealch;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@RestController
public class UsersController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    public UsersController(UserRepository userRepository, OrganizationRepository organizationRepository) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
    }

    /**
     * Gets the current user id if authenticated. Used to inspect indirectly whether
     * a
     * cookie is set that can be used to
     * authenticate as clients don't have access to read HTTP-only cookies.
     */
    @GetMapping("/api/users/current/id")
    public ResponseEntity<?> getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return ResponseEntity.ok(userDetails.getId().toString());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    record CreateUserRequest(String name, String username, String password) {
    }

    @PostMapping("/api/users")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        if (request == null || request.name() == null || request.username() == null || request.password() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "name, username, and password are required"));
        }

        User user = new User();
        user.setName(request.name());
        user.setUsername(request.username());
        user.setPassword(request.password());
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "username", user.getUsername()));
    }

    @GetMapping("/api/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "username", user.getUsername())))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found")));
    }

    record GetUserOrganizationsResponse(Long id, String name) {
    }

    @GetMapping("/api/users/{userId}/organizations")
    public ResponseEntity<?> getUserOrganizations(@PathVariable Long userId) {
        // Controversal opinions:
        // - The concept of controllers makes little sense when you
        // start cross-cutting concerns and
        // suddenly need repositories in the users controller that have nothing to do
        // with users.
        // - The "Get or create" pattern can be implemented in many SQL dialects with
        // just one query but ORMs
        // need to do at least two to achieve this. This is another reason I prefer to
        // not use ORMs outside of this project

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    if (user.getOrganizations().isEmpty()) {
                        Organization defaultOrganization = new Organization();
                        defaultOrganization.setName("Default");
                        defaultOrganization.addMember(user);
                        organizationRepository.save(defaultOrganization);
                    }

                    return ResponseEntity.ok(user.getOrganizations().stream()
                            .map(org -> new GetUserOrganizationsResponse(org.getId(), org.getName()))
                            .toList());
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found")));
    }

    /**
     * Gets the projects of a user. The projects are assigned to the user through
     * their organization. If the user does not have any organizations, a default
     * organization is created for them and they are added to it.
     * If the organization they are part of doesn't have any projects, a default
     * project is created for them and assigned to the organization.
     */
    @GetMapping("/api/users/{userId}/projects")
    public ResponseEntity<?> getUserProjects(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    if (user.getOrganizations().isEmpty()) {
                        Organization defaultOrganization = new Organization();
                        defaultOrganization.setName("Default");
                        defaultOrganization.addMember(user);
                        organizationRepository.save(defaultOrganization);
                    }

                    user.getOrganizations().forEach(organization -> {
                        if (organization.getProjects().isEmpty()) {
                            Project defaultProject = new Project();
                            defaultProject.setName("Default");
                            organization.addProject(defaultProject);
                            organizationRepository.save(organization);
                        }
                    });

                    return ResponseEntity.ok(user.getOrganizations().stream()
                            .flatMap(organization -> organization.getProjects().stream()
                                    .map(project -> Map.of(
                                            "id", project.getId(),
                                            "name", project.getName(),
                                            "organization",
                                            Map.of("id", organization.getId(), "name", organization.getName()))))
                            .toList());
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found")));
    }

    /**
     * Creates a new project for a user within a specific organization.
     */
    @PostMapping("/api/users/{userId}/organizations/{organizationId}/projects")
    public ResponseEntity<?> createProjectForUser(@PathVariable Long userId, @PathVariable Long organizationId,
            @RequestBody Map<String, String> request) {
        String projectName = request.get("name");
        if (projectName == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "project name is required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    Organization organization = organizationRepository.findById(organizationId).orElse(null);
                    if (organization == null || !organization.getMembers().contains(user)) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of("error", "organization not found or user is not a member"));
                    }

                    Project project = new Project();
                    project.setName(projectName);
                    organization.addProject(project);
                    organizationRepository.save(organization);

                    return ResponseEntity.status(HttpStatus.CREATED).build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found")));
    }
}
