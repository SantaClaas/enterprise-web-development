package com.yealch.yealch;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectsController {

    private final ProjectRepository projectRepository;

    public ProjectsController(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable Long projectId, Authentication authentication) {
        Long authenticatedUserId = UsersController.getUserId(authentication).orElse(null);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        var foundProject = projectRepository.findById(projectId);
        if (foundProject.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "project not found"));
        }

        Project project = foundProject.get();
        Organization organization = project.getOrganization();
        if (organization == null
                || organization.getMembers().stream().noneMatch(member -> authenticatedUserId.equals(member.getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        projectRepository.delete(project);
        return ResponseEntity.noContent().build();
    }
}
