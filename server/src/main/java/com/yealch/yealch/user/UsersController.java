package com.yealch.yealch.user;

import com.yealch.yealch.auth.CustomUserDetails;
import com.yealch.yealch.organization.Organization;
import com.yealch.yealch.organization.OrganizationRepository;
import com.yealch.yealch.organization.OrganizationRole;
import com.yealch.yealch.project.Project;
import com.yealch.yealch.project.ProjectRepository;
import com.yealch.yealch.time.Time;
import com.yealch.yealch.time.TimeRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
import org.springframework.web.bind.annotation.RequestParam;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


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

    public static Optional<UUID> getUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return Optional.of(userDetails.getId());
        }

        return Optional.empty();
    }

    record ErrorResponse(String error) {}

    record GetUserOrganizationsResponse(UUID id, String name) {}

    record GetUserProjectsOrganizationResponse(UUID id, String name) {}
    record GetUserProjectsResponse(UUID id, String name, GetUserProjectsOrganizationResponse organization) {}

    record PostUserOrganizationProjectsRequest(String name) {}

    record PostUserProjectsTimesRequest(String start, String end) {}
    record PostUserTimesOrganizationResponse(UUID id, String name) {}
    record PostUserTimesProjectResponse(UUID id, String name, PostUserTimesOrganizationResponse organization) {}
    record PostUserTimesResponse(UUID id, String start, String end, PostUserTimesProjectResponse project) {}

    record GetUserTimesOrganizationResponse(UUID id, String name) {}
    record GetUserTimesProjectResponse(UUID id, String name, GetUserTimesOrganizationResponse organization) {}
    record GetUserTimesResponse(UUID id, String start, String end, GetUserTimesProjectResponse project) {}

    record UpdateProjectRequest(String name, UUID organizationId) {}

    record UpdateTimeRequest(UUID id, String start, String end) {}

    /**
     * Gets the current user id if authenticated. Used to inspect indirectly whether
     * a cookie is set that can be used to authenticate, as clients don't have
     * access to read HTTP-only cookies.
     */
    @GetMapping("/api/users/current/id")
    public ResponseEntity<?> getCurrentUserId(Authentication authentication) {
        Optional<UUID> userId = getUserId(authentication);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(userId.get().toString());
    }

    @GetMapping("/api/users/{userId}/organizations")
    public ResponseEntity<?> getUserOrganizations(@PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        Optional<UUID> authenticatedUserId = getUserId(authentication);
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

                    var pageable = PageRequest.of(page, size, Sort.by("name"));
                    return ResponseEntity.ok(organizationRepository.findByUserId(userId, pageable)
                            .getContent().stream()
                            .map(organization -> new GetUserOrganizationsResponse(organization.getId(), organization.getName()))
                            .toList());
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("user not found")));
    }

    /**
     * Gets the projects of a user. The projects are assigned to the user through
     * their organization. If the user does not have any organizations, a default
     * organization is created for them and they are added to it.
     * If the organization they are part of doesn't have any projects, a default
     * project is created for them and assigned to the organization.
     */
    @GetMapping("/api/users/{userId}/projects")
    public ResponseEntity<?> getUserProjects(@PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        Optional<UUID> authenticatedUserId = getUserId(authentication);
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

                    var pageable = PageRequest.of(page, size, Sort.by("name"));
                    return ResponseEntity.ok(projectRepository.findByUserId(userId, pageable)
                            .getContent().stream()
                            .map(project -> new GetUserProjectsResponse(
                                    project.getId(),
                                    project.getName(),
                                    new GetUserProjectsOrganizationResponse(
                                            project.getOrganization().getId(),
                                            project.getOrganization().getName())))
                            .toList());
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("user not found")));
    }

    /**
     * Creates a new project for a user within a specific organization.
     */
    @PostMapping("/api/users/{userId}/organizations/{organizationId}/projects")
    public ResponseEntity<?> createProjectForUser(@PathVariable UUID userId, @PathVariable UUID organizationId,
            @RequestBody PostUserOrganizationProjectsRequest request, Authentication authentication) {
        Optional<UUID> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request == null || request.name() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("project name is required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    Organization organization = organizationRepository.findById(organizationId).orElse(null);
                    if (organization == null || !organization.hasMember(user.getId())) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(new ErrorResponse("organization not found or user is not a member"));
                    }

                    Project project = new Project();
                    project.setName(request.name());
                    organization.addProject(project);
                    organizationRepository.save(organization);

                    return ResponseEntity.status(HttpStatus.CREATED).build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("user not found")));
    }

    /** Creates a new time entry for a user on a project */
    @PostMapping("/api/users/{userId}/projects/{projectId}/times")
    public ResponseEntity<?> createTimeEntry(@PathVariable UUID userId, @PathVariable UUID projectId,
            @RequestBody PostUserProjectsTimesRequest request, Authentication authentication) {

        Optional<UUID> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request == null || request.start() == null || request.end() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("start and end are required"));
        }

        OffsetDateTime start;
        OffsetDateTime end;
        try {
            start = OffsetDateTime.parse(request.start());
            end = OffsetDateTime.parse(request.end());
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("invalid start or end format, expected ISO 8601 format with timezone offset"));
        }

        if (!start.isBefore(end)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("start must be before end"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> projectRepository.findById(projectId)
                        .<ResponseEntity<?>>map(project -> {
                            Organization organization = project.getOrganization();
                            if (organization == null || !organization.hasMember(user.getId())) {
                                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new ErrorResponse("project not found or user is not a member"));
                            }

                            Time time = new Time();
                            time.setStart(start);
                            time.setEnd(end);
                            time.setProject(project);
                            timeRepository.save(time);

                            return ResponseEntity.status(HttpStatus.CREATED).body(new PostUserTimesResponse(
                                    time.getId(),
                                    time.getStart().toString(),
                                    time.getEnd().toString(),
                                    new PostUserTimesProjectResponse(
                                            project.getId(),
                                            project.getName(),
                                            new PostUserTimesOrganizationResponse(
                                                    organization.getId(),
                                                    organization.getName()))));
                        })
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(new ErrorResponse("project not found"))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("user not found")));
    }

    @GetMapping("/api/users/{userId}/times")
    public ResponseEntity<?> getUserTimeEntries(@PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            Authentication authentication) {
        Optional<UUID> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("user not found"));
        }

        var pageable = PageRequest.of(page, size, Sort.by("start").descending());
        return ResponseEntity.ok(timeRepository.findByUserId(userId, pageable)
                .getContent().stream()
                .map(time -> new GetUserTimesResponse(
                        time.getId(),
                        time.getStart().toString(),
                        time.getEnd().toString(),
                        new GetUserTimesProjectResponse(
                                time.getProject().getId(),
                                time.getProject().getName(),
                                new GetUserTimesOrganizationResponse(
                                        time.getProject().getOrganization().getId(),
                                        time.getProject().getOrganization().getName()))))
                .toList());
    }

    /** Creates a new organization with this user in it */
    @PostMapping("/api/users/{userId}/organizations")
    public ResponseEntity<?> createOrganizationForUser(@PathVariable UUID userId,
            @RequestBody String organizationName, Authentication authentication) {
        Optional<UUID> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (organizationName == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("organization name is required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    Organization organization = new Organization();
                    organization.setName(organizationName);
                    organization.addMember(user, OrganizationRole.OWNER);
                    organizationRepository.save(organization);

                    return ResponseEntity.status(HttpStatus.CREATED).build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("user not found")));
    }

    @PutMapping("/api/users/{userId}/organizations/{organizationId}/name")
    public ResponseEntity<?> updateOrganizationName(@PathVariable UUID userId, @PathVariable UUID organizationId,
            @RequestBody String newName, Authentication authentication) {

        Optional<UUID> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (newName == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("organization name is required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> organizationRepository.findById(organizationId)
                        .<ResponseEntity<?>>map(organization -> {
                            if (!organization.hasMemberWithRole(user.getId(), OrganizationRole.ADMINISTRATOR, OrganizationRole.OWNER)) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(new ErrorResponse("user does not have permission to edit the organization"));
                            }

                            organization.setName(newName);
                            organizationRepository.save(organization);

                            return ResponseEntity.ok().build();
                        })
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(new ErrorResponse("organization not found"))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("user not found")));
    }

    @PutMapping("/api/users/{userId}/projects/{projectId}")
    public ResponseEntity<?> updateProject(@PathVariable UUID userId, @PathVariable UUID projectId,
            @RequestBody UpdateProjectRequest request, Authentication authentication) {

        Optional<UUID> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request == null || request.name() == null || request.organizationId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("name and organizationId are required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> projectRepository.findById(projectId)
                        .<ResponseEntity<?>>map(project -> {
                            if (!project.getOrganization().hasMember(user.getId())) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(new ErrorResponse("user is not a member of the project"));
                            }

                            project.setName(request.name());
                            project.setOrganizationId(request.organizationId());
                            projectRepository.save(project);

                            return ResponseEntity.ok().build();
                        })
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(new ErrorResponse("project not found"))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("user not found")));
    }

    @PutMapping("/api/users/{userId}/times")
    public ResponseEntity<?> updateUserTimes(@PathVariable UUID userId,
            @RequestBody List<UpdateTimeRequest> request, Authentication authentication) {

        Optional<UUID> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("request body is required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    for (UpdateTimeRequest item : request) {
                        if (item == null || item.id() == null || item.start() == null || item.end() == null) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(new ErrorResponse("id, start and end are required for each time"));
                        }

                        OffsetDateTime start;
                        OffsetDateTime end;
                        try {
                            start = OffsetDateTime.parse(item.start());
                            end = OffsetDateTime.parse(item.end());
                        } catch (DateTimeParseException e) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(new ErrorResponse("invalid start or end format, expected ISO 8601 format with timezone offset"));
                        }

                        if (!start.isBefore(end)) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(new ErrorResponse("start must be before end"));
                        }

                        var foundTime = timeRepository.findById(item.id());
                        if (foundTime.isEmpty()) {
                            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                    .body(new ErrorResponse("time not found: " + item.id()));
                        }

                        Time time = foundTime.get();
                        Project project = time.getProject();
                        if (project == null || project.getOrganization() == null
                                || !project.getOrganization().hasMember(user.getId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body(new ErrorResponse("user is not allowed to modify time: " + item.id()));
                        }

                        time.setStart(start);
                        time.setEnd(end);
                        timeRepository.save(time);
                    }

                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("user not found")));
    }

    @DeleteMapping("/api/users/{userId}/times")
    public ResponseEntity<?> deleteUserTimes(@PathVariable UUID userId,
            @RequestBody List<UUID> request, Authentication authentication) {

        Optional<UUID> authenticatedUserId = getUserId(authentication);
        if (authenticatedUserId.isEmpty() || !authenticatedUserId.get().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("request body is required"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    for (UUID timeId : request) {
                        if (timeId == null) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(new ErrorResponse("time id must be provided"));
                        }

                        var foundTime = timeRepository.findById(timeId);
                        if (foundTime.isEmpty()) {
                            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                    .body(new ErrorResponse("time not found: " + timeId));
                        }

                        Time time = foundTime.get();
                        Project project = time.getProject();
                        if (project == null || project.getOrganization() == null
                                || !project.getOrganization().hasMember(user.getId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body(new ErrorResponse("user is not allowed to delete time: " + timeId));
                        }

                        timeRepository.delete(time);
                    }

                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("user not found")));
    }
}
