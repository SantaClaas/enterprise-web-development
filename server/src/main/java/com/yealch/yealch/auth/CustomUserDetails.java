package com.yealch.yealch.auth;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;
import java.util.UUID;

/**
 * CustomUserDetails is a class that extends the User class from Spring
 * Security. It adds an additional field for the user's unique identifier
 * (UUID).
 */
public class CustomUserDetails extends User {

    private final UUID id;

    public CustomUserDetails(UUID id, String username, String password,
            Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
        this.id = id;
    }

    public UUID getId() {
        return id;
    }
}
