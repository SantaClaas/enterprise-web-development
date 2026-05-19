package com.yealch.yealch;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;

@Service
public class JwtService {

    public static final String COOKIE_NAME = "AUTH_TOKEN";

    private final SecretKey signingKey;
    private final long expirationMillis;

    public JwtService(@Value("${app.jwt.secret}") String base64Secret,
            @Value("${app.jwt.expiration-minutes:60}") long expirationMinutes) {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(base64Secret);
        } catch (IllegalArgumentException ex) {
            keyBytes = base64Secret.getBytes(StandardCharsets.UTF_8);
        }

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMillis = Duration.ofMinutes(expirationMinutes).toMillis();
    }

    public String generateToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiration)
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        Claims claims = extractClaims(token);
        return userDetails.getUsername().equals(claims.getSubject()) && !claims.getExpiration().before(new Date());
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
