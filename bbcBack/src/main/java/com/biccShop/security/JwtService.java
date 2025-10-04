package com.biccShop.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Duration;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private static final SignatureAlgorithm ALG = SignatureAlgorithm.HS256;
    private static final int HS256_KEY_BYTES = 32;

    private static final String CLAIM_USERNAME = "username";
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_ROLES = "roles";

    @Value("${app.jwt.secret}")
    private String secretBase64;

    @Value("${app.jwt.expiration-seconds:86400}") // 24h default
    private long expirationSeconds;

    private volatile Key cachedKey;

    // Public API -------------------------------------------------------------

    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails, null, Map.of());
    }

    public String generateToken(UserDetails userDetails, String emailOverride) {
        return generateToken(userDetails, emailOverride, Map.of());
    }

    public String generateToken(UserDetails userDetails,
                                String emailOverride,
                                Map<String, Object> extraClaims) {

        String username = userDetails.getUsername();
        String email = (emailOverride == null || emailOverride.isBlank()) ? username : emailOverride;

        List<String> roles = userDetails.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .sorted()
                .collect(Collectors.toList());

        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put(CLAIM_USERNAME, username);
        claims.put(CLAIM_EMAIL, email);
        claims.put(CLAIM_ROLES, roles);

        Date now = new Date();
        Date exp = new Date(now.getTime() + Duration.ofSeconds(expirationSeconds).toMillis());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username) // keep subject = principal identifier
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(getSignInKey(), ALG)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String subject = extractUsername(token);
        return subject.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // Extraction helpers ----------------------------------------------------

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractEmail(String token) {
        return extractClaim(token, c -> asString(c.get(CLAIM_EMAIL)));
    }

    public List<String> extractRoles(String token) {
        return extractClaim(token, c -> {
            Object v = c.get(CLAIM_ROLES);
            if (v instanceof Collection<?> col) {
                return col.stream().map(Object::toString).collect(Collectors.toList());
            }
            return List.of();
        });
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    // Internal --------------------------------------------------------------

    private Claims extractAllClaims(String token) {
        if (token == null || token.isBlank() || !token.contains(".")) {
            throw new IllegalArgumentException("Invalid JWT");
        }
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private Key getSignInKey() {
        Key local = cachedKey;
        if (local == null) {
            synchronized (this) {
                local = cachedKey;
                if (local == null) {
                    byte[] keyBytes = decodeFlexible(secretBase64);
                    if (keyBytes.length != HS256_KEY_BYTES) {
                        throw new IllegalStateException("HS256 requires 32 decoded bytes, got " + keyBytes.length);
                    }
                    cachedKey = local = Keys.hmacShaKeyFor(keyBytes);
                }
            }
        }
        return local;
    }

    private byte[] decodeFlexible(String value) {
        String s = value == null ? "" : value.trim();
        if (s.isEmpty()) throw new IllegalStateException("JWT secret missing");
        try {
            return Decoders.BASE64.decode(s);
        } catch (DecodingException e) {
            try {
                return Decoders.BASE64URL.decode(s);
            } catch (DecodingException ex) {
                throw new IllegalStateException("Secret not valid Base64/Base64URL", ex);
            }
        }
    }

    private String asString(Object o) {
        return o == null ? null : o.toString();
    }
}