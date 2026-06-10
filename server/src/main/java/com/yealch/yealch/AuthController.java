package com.yealch.yealch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
            PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    private ResponseEntity<?> authenticate(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String token = jwtService.generateToken(userDetails);
        ResponseCookie cookie = ResponseCookie.from(JwtService.COOKIE_NAME, token)
                .httpOnly(true)
                // Disable this as localhost is not seen as secure in Safari
                .secure(true)
                .path("/")
                // API is proxied in localhost development and frontend is hosted by this server
                // in production
                .sameSite("Strict")
                .maxAge(Duration.ofMinutes(60))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                // Returnin the user id to avoid unecessary round trip the client would need to
                // do to get the user id as the cookie which could contain the id is not exposed
                // to JS
                .body(userDetails.getId().toString());
    }

    @PostMapping("/sign-ins")
    public ResponseEntity<?> createSignIn(
            // Setting required to false to return 401 instead of 400
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {

        logger.info("Received sign-in request");
        String base64Credentials = authorizationHeader.substring("Basic ".length());
        String credentials;
        try {
            credentials = new String(Base64.getDecoder().decode(base64Credentials), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        int index = credentials.indexOf(':');
        if (index == -1) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = credentials.substring(0, index);
        String password = credentials.substring(index + 1);

        logger.info("Login attempt for user: {}", username);

        return authenticate(username, password);
    }

    @PostMapping("/sign-outs")
    public ResponseEntity<?> createSignOut() {
        ResponseCookie cookie = ResponseCookie.from(JwtService.COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Strict")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("status", "logged out"));
    }

    record SignUpRequest(String name, String username, String password) {
    }

    @PostMapping("/sign-ups")
    public ResponseEntity<?> createSignUp(@RequestBody SignUpRequest signUpRequest) {
        if (signUpRequest.username == null || signUpRequest.password == null
                || signUpRequest.name == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }

        // TODO this allows attackers to scope out who is using the service. This needs
        // to be changed to a generic error message or some other solution
        if (userRepository.findByUsername(signUpRequest.username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Username already exists"));
        }

        var user = new User();
        user.setName(signUpRequest.name);
        user.setUsername(signUpRequest.username);
        user.setPassword(passwordEncoder.encode(signUpRequest.password));
        userRepository.save(user);

        // Doing an unnecessary round trip checkin the password again but oh well
        return authenticate(signUpRequest.username, signUpRequest.password);
    }
}
