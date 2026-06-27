package com.yealch.yealch;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.Optional;
import java.util.stream.StreamSupport;

@RestController
public class UsersController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final ProjectRepository projectRepository;
    private final TimeRepository timeRepository;

    public UsersController(UserRepository userRepository, OrganizationRepository organizationRepository,
            ProjectRepository projectRepository, TimeRepository timeRepository) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.projectRepository = projectRepository;
        this.timeRepository = timeRepository;
    }

    static Optional<Long> getUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return Optional.of(userDetails.getId());
        }

        return Optional.empty();
    }

    /**
     * Gets the current user id if authenticated. Used to inspect indirectly whether
     * a
     * cookie is set that can be used to
     * authenticate as clients don't have access to read HTTP-only cookies.
     */
    @GetMapping("/api/users/current/id")
    public ResponseEntity<?> getCurrentUserId(Authentication authentication) {

        Optional<Long> userId = getUserId(authentication);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(userId.get().toString());
    }

    record CreateUserRequest(String name, String username, String password) {
    }

    record GetUserOrganizationsResponse(Long id, String name) {
    }

    @GetMapping("/api/users/{userId}/organizations")
    public ResponseEntity<?> getUserOrganizations(@PathVariable Long userId, Authentication authentication) {
        Optional<Long> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

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
                        defaultOrganization.setName(user.getName() + " Organization");
                        defaultOrganization.addMember(user, OrganizationRole.OWNER);
                        organizationRepository.save(defaultOrganization);
                    }

                    return ResponseEntity.ok(user.getOrganizations().stream()
                            .map(organization -> new GetUserOrganizationsResponse(organization.getId(), organization.getName()))
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
    public ResponseEntity<?> getUserProjects(@PathVariable Long userId, Authentication authentication) {
        Optional<Long> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    if (user.getOrganizations().isEmpty()) {
                        Organization defaultOrganization = new Organization();
                        defaultOrganization.setName(user.getName() + " Organization");
                        defaultOrganization.addMember(user, OrganizationRole.OWNER);
                        organizationRepository.save(defaultOrganization);
                    }

                    user.getOrganizations().forEach(organization -> {
                        if (organization.getProjects().isEmpty()) {
                            Project defaultProject = new Project();
                            defaultProject.setName(organization.getName() + " Project");
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
            @RequestBody Map<String, String> request, Authentication authentication) {
        Optional<Long> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String projectName = request.get("name");
        if (projectName == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "project name is required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    Organization organization = organizationRepository.findById(organizationId).orElse(null);
                    if (organization == null || !organization.hasMember(user.getId())) {
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

    /** Creates a new time entry for a user on a project */
    @PostMapping("/api/users/{userId}/projects/{projectId}/times")
    public ResponseEntity<?> createTimeEntry(@PathVariable Long userId, @PathVariable Long projectId,
            @RequestBody Map<String, String> request, Authentication authentication) {

        Optional<Long> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request == null || request.get("start") == null || request.get("end") == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "start and end are required"));
        }

        String startString = request.get("start");
        String endString = request.get("end");
        OffsetDateTime start;
        OffsetDateTime end;
        try {
            start = OffsetDateTime.parse(startString);
            end = OffsetDateTime.parse(endString);
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error",
                            "invalid start or end format, expected ISO 8601 format with timezone offset"));
        }

        if (!start.isBefore(end)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "start must be before end"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> projectRepository.findById(projectId)
                        .<ResponseEntity<?>>map(project -> {
                            Organization organization = project.getOrganization();
                            if (organization == null || !organization.hasMember(user.getId())) {
                                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(Map.of("error", "project not found or user is not a member"));
                            }

                            Time time = new Time();
                            time.setStart(start);
                            time.setEnd(end);
                            time.setProject(project);
                            timeRepository.save(time);

                            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                                    "id", time.getId(),
                                    "start", time.getStart().toString(),
                                    "end", time.getEnd().toString(),
                                    "project", Map.of(
                                            "id", project.getId(),
                                            "name", project.getName(),
                                            "organization", Map.of(
                                                    "id", organization.getId(),
                                                    "name", organization.getName()))));
                        })
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of("error", "project not found"))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found")));

    }

    @GetMapping("/api/users/{userId}/times")
    public ResponseEntity<?> getUserTimeEntries(@PathVariable Long userId, Authentication authentication) {
        Optional<Long> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(
                        StreamSupport.stream(timeRepository.findAll().spliterator(), false)
                                .filter(time -> {
                                    Project project = time.getProject();
                                    if (project == null) {
                                        return false;
                                    }
                                    Organization organization = project.getOrganization();
                                    if (organization == null) {
                                        return false;
                                    }
                                    return organization.hasMember(user.getId());
                                })
                                .map(time -> Map.of(
                                        "id", time.getId(),
                                        "start", time.getStart().toString(),
                                        "end", time.getEnd().toString(),
                                        "project", Map.of(
                                                "id", time.getProject().getId(),
                                                "name", time.getProject().getName(),
                                                "organization", Map.of(
                                                        "id", time.getProject().getOrganization().getId(),
                                                        "name", time.getProject().getOrganization().getName()))))
                                .toList()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "user not found")));
    }

    /** Creates a new organization with this user in it */
    @PostMapping("/api/users/{userId}/organizations")
    public ResponseEntity<?> createOrganizationForUser(@PathVariable Long userId,
            @RequestBody String organizationName, Authentication authentication) {
        Optional<Long> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (organizationName == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "organization name is required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    Organization organization = new Organization();
                    organization.setName(organizationName);
                    organization.addMember(user, OrganizationRole.OWNER);
                    organizationRepository.save(organization);

                    return ResponseEntity.status(HttpStatus.CREATED).build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found")));
    }

    @PutMapping("/api/users/{userId}/organizations/{organizationId}/name")
    public ResponseEntity<?> updateOrganizationName(@PathVariable Long userId, @PathVariable Long organizationId,
            @RequestBody String newName, Authentication authentication) {

        Optional<Long> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (newName == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "organization name is required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> organizationRepository.findById(organizationId)
                        .<ResponseEntity<?>>map(organization -> {
                            if (!organization.hasMemberWithRole(user.getId(), OrganizationRole.ADMINISTRATOR, OrganizationRole.OWNER)) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(Map.of("error", "user does not have permission to edit the organization"));
                            }

                            organization.setName(newName);
                            organizationRepository.save(organization);

                            return ResponseEntity.ok().build();
                        })
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of("error", "organization not found"))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found")));
    }

    record UpdateProjectRequest(String name, Long organizationId) {
    }

    @PutMapping("/api/users/{userId}/projects/{projectId}")
    public ResponseEntity<?> updateProject(@PathVariable Long userId, @PathVariable Long projectId,
            @RequestBody UpdateProjectRequest request, Authentication authentication) {

        Optional<Long> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request == null || request.name() == null || request.organizationId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "name and organizationId are required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> projectRepository.findById(projectId)
                        .<ResponseEntity<?>>map(project -> {
                            if (!project.getOrganization().hasMember(user.getId())) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(Map.of("error", "user is not a member of the project"));
                            }

                            project.setName(request.name());
                            project.setOrganizationId(request.organizationId());
                            projectRepository.save(project);

                            return ResponseEntity.ok().build();
                        })
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of("error", "project not found"))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found")));
    }

    record UpdateTimeRequest(String id, String start, String end) {
    }

    @PutMapping("/api/users/{userId}/times")
    public ResponseEntity<?> updateUserTimes(@PathVariable Long userId,
            @RequestBody java.util.List<UpdateTimeRequest> request, Authentication authentication) {

        Optional<Long> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "request body is required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    for (UpdateTimeRequest item : request) {
                        if (item == null || item.id() == null || item.start() == null || item.end() == null) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("error", "id, start and end are required for each time"));
                        }

                        Long timeId;
                        try {
                            timeId = Long.parseLong(item.id());
                        } catch (NumberFormatException e) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("error", "invalid time id: " + item.id()));
                        }

                        OffsetDateTime start;
                        OffsetDateTime end;
                        try {
                            start = OffsetDateTime.parse(item.start());
                            end = OffsetDateTime.parse(item.end());
                        } catch (java.time.format.DateTimeParseException e) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("error",
                                            "invalid start or end format, expected ISO 8601 format with timezone offset"));
                        }

                        if (!start.isBefore(end)) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("error", "start must be before end"));
                        }

                        var foundTime = timeRepository.findById(timeId);
                        if (foundTime.isEmpty()) {
                            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                    .body(Map.of("error", "time not found: " + timeId));
                        }

                        Time time = foundTime.get();
                        Project project = time.getProject();
                        if (project == null || project.getOrganization() == null
                                || !project.getOrganization().hasMember(user.getId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body(Map.of("error", "user is not allowed to modify time: " + timeId));
                        }

                        time.setStart(start);
                        time.setEnd(end);
                        timeRepository.save(time);
                    }

                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found")));
    }

    @DeleteMapping("/api/users/{userId}/times")
    public ResponseEntity<?> deleteUserTimes(@PathVariable Long userId,
            @RequestBody java.util.List<String> request, Authentication authentication) {

        Optional<Long> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "request body is required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    for (String rawTimeId : request) {
                        if (rawTimeId == null) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("error", "time id must be provided"));
                        }

                        Long timeId;
                        try {
                            timeId = Long.parseLong(rawTimeId);
                        } catch (NumberFormatException e) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("error", "invalid time id: " + rawTimeId));
                        }

                        var foundTime = timeRepository.findById(timeId);
                        if (foundTime.isEmpty()) {
                            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                    .body(Map.of("error", "time not found: " + timeId));
                        }

                        Time time = foundTime.get();
                        Project project = time.getProject();
                        if (project == null || project.getOrganization() == null
                                || !project.getOrganization().hasMember(user.getId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body(Map.of("error", "user is not allowed to delete time: " + timeId));
                        }

                        timeRepository.delete(time);
                    }

                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found")));
    }
}
