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

    public UsersController(UserRepository userRepository) {
        this.userRepository = userRepository;
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

}
