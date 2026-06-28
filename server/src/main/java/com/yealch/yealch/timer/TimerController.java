package com.yealch.yealch.timer;

import com.yealch.yealch.project.Project;
import com.yealch.yealch.project.ProjectRepository;
import com.yealch.yealch.time.Time;
import com.yealch.yealch.time.TimeRepository;
import com.yealch.yealch.user.UserRepository;
import com.yealch.yealch.user.UsersController;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/users/{userId}/timer", produces = MediaType.APPLICATION_JSON_VALUE)
public class TimerController {

    private final TimerRepository timerRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TimeRepository timeRepository;

    public TimerController(TimerRepository timerRepository, UserRepository userRepository,
            ProjectRepository projectRepository, TimeRepository timeRepository) {
        this.timerRepository = timerRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.timeRepository = timeRepository;
    }

    record ErrorResponse(String error) {
    }

    record TimerStartPauseResponse(String id, String startedAt, String pausedAt) {
    }

    record TimerResponse(
            String status,
            String currentPeriodStart,
            long accumulatedMilliseconds,
            List<TimerStartPauseResponse> entries) {
    }

    record CreateTimerStopRequest(UUID projectId) {
    }

    private UUID authenticatedUserId(Authentication authentication) {
        return UsersController.getUserId(authentication).orElse(null);
    }

    private boolean isUnauthorized(UUID authenticatedId, UUID userId) {
        return authenticatedId == null || !authenticatedId.equals(userId);
    }

    private TimerResponse toResponse(Timer timer) {
        long accumulatedMilliseconds = timer.getStartPauseEntries().stream()
                .filter(e -> e.getPausedAt() != null)
                .mapToLong(e -> Duration.between(e.getStartedAt(), e.getPausedAt()).toMillis())
                .sum();

        String currentPeriodStart = null;
        String status;
        if (timer.isRunning()) {
            status = "RUNNING";
            currentPeriodStart = timer.getLastEntry().getStartedAt().toString();
        } else {
            status = "PAUSED";
        }

        List<TimerStartPauseResponse> entries = timer.getStartPauseEntries().stream()
                .map(entry -> new TimerStartPauseResponse(
                        entry.getId().toString(),
                        entry.getStartedAt().toString(),
                        entry.getPausedAt() != null ? entry.getPausedAt().toString() : null))
                .toList();

        return new TimerResponse(status, currentPeriodStart, accumulatedMilliseconds, entries);
    }

    @GetMapping
    public ResponseEntity<?> getTimer(@PathVariable UUID userId, Authentication authentication) {
        UUID authId = authenticatedUserId(authentication);
        if (isUnauthorized(authId, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return timerRepository.findByUser_Id(userId)
                .<ResponseEntity<?>>map(timer -> ResponseEntity.ok(toResponse(timer)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Creates a start for the timer: starts a new timer or resumes a paused one.
     */
    @PostMapping("/start")
    public ResponseEntity<?> createTimerStart(@PathVariable UUID userId, Authentication authentication) {
        UUID authId = authenticatedUserId(authentication);
        if (isUnauthorized(authId, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        var existing = timerRepository.findByUser_Id(userId);

        if (existing.isEmpty()) {
            var user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("user not found"));
            }

            Timer timer = new Timer();
            timer.setUser(user);

            TimerStartPause entry = new TimerStartPause();
            entry.setStartedAt(OffsetDateTime.now());
            timer.addStartPauseEntry(entry);

            timerRepository.save(timer);
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(timer));
        }

        Timer timer = existing.get();

        if (!timer.isRunning()) {
            TimerStartPause entry = new TimerStartPause();
            entry.setStartedAt(OffsetDateTime.now());
            timer.addStartPauseEntry(entry);
            timerRepository.save(timer);
        }

        return ResponseEntity.ok(toResponse(timer));
    }

    /**
     * Creates a pause for the timer: sets the pause time on the current running
     * entry.
     */
    @PostMapping("/pause")
    public ResponseEntity<?> createTimerPause(@PathVariable UUID userId, Authentication authentication) {
        UUID authId = authenticatedUserId(authentication);
        if (isUnauthorized(authId, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Timer timer = timerRepository.findByUser_Id(userId).orElse(null);
        if (timer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("no active timer"));
        }

        if (timer.isRunning()) {
            timer.getLastEntry().setPausedAt(OffsetDateTime.now());
            timerRepository.save(timer);
        }

        return ResponseEntity.ok(toResponse(timer));
    }

    /**
     * Stops the timer: pauses the running entry if needed, converts all entries to
     * time records, deletes the timer.
     */
    @PostMapping(value = "/stop", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createTimerStop(@PathVariable UUID userId,
            @RequestBody CreateTimerStopRequest request, Authentication authentication) {
        UUID authenticatedUserId = authenticatedUserId(authentication);
        if (isUnauthorized(authenticatedUserId, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request == null || request.projectId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("projectId is required"));
        }

        Timer timer = timerRepository.findByUser_Id(userId).orElse(null);
        if (timer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("no active timer"));
        }

        if (timer.isRunning()) {
            timer.getLastEntry().setPausedAt(OffsetDateTime.now());
        }

        Project project = projectRepository.findById(request.projectId()).orElse(null);
        if (project == null || project.getOrganization() == null
                || !project.getOrganization().hasMember(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("project not found or user is not a member"));
        }

        for (TimerStartPause entry : timer.getStartPauseEntries()) {
            Time time = new Time();
            time.setStart(entry.getStartedAt());
            time.setEnd(entry.getPausedAt());
            time.setProject(project);
            timeRepository.save(time);
        }

        timerRepository.delete(timer);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/entries/{entryId}")
    public ResponseEntity<?> deleteTimerEntry(@PathVariable UUID userId, @PathVariable UUID entryId,
            Authentication authentication) {
        UUID authenticatedUserId = authenticatedUserId(authentication);
        if (isUnauthorized(authenticatedUserId, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Timer timer = timerRepository.findByUser_Id(userId).orElse(null);
        if (timer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("no active timer"));
        }

        boolean isRemoved = timer.getStartPauseEntries().removeIf(entry -> entry.getId().equals(entryId));
        if (!isRemoved) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("entry not found"));
        }

        timerRepository.save(timer);
        return ResponseEntity.ok(toResponse(timer));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteTimer(@PathVariable UUID userId, Authentication authentication) {
        UUID authenticatedUserId = authenticatedUserId(authentication);
        if (isUnauthorized(authenticatedUserId, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        timerRepository.findByUser_Id(userId).ifPresent(timerRepository::delete);

        return ResponseEntity.noContent().build();
    }
}
