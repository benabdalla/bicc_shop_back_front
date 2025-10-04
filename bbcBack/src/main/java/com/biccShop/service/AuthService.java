package com.biccShop.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.biccShop.dao.AdminDA;
import com.biccShop.dao.CustomerDA;
import com.biccShop.dao.SellerDA;
import com.biccShop.dto.AuthRequest;
import com.biccShop.dto.AuthResponse;
import com.biccShop.security.JwtService;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AdminDA adminDA;
    private final CustomerDA customerDA;
    private final SellerDA sellerDA;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       AdminDA adminDA,
                       CustomerDA customerDA,
                       SellerDA sellerDA) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.adminDA = adminDA;
        this.customerDA = customerDA;
        this.sellerDA = sellerDA;
    }

    public AuthResponse login(AuthRequest req) {
        var admin = adminDA.findByEmail(normalize(req.getEmail()));
        return buildAuthResponse(req, admin.getEmail(), admin.getPassword(), admin.getRole() != null ? admin.getRole().name() : null, admin);
    }

    public AuthResponse customerLogin(AuthRequest req) {
        var customer = customerDA.findByEmail(normalize(req.getEmail()));
        return buildAuthResponse(req, customer.getEmail(), customer.getPassword(), customer.getRole() != null ? customer.getRole().name() : null, customer);
    }

    public AuthResponse sellerLogin(AuthRequest req) {
        var seller = sellerDA.findByEmail(normalize(req.getEmail()));
        return buildAuthResponse(req, seller.getEmail(), seller.getPassword(), seller.getRole() != null ? seller.getRole().name() : null, seller);
    }

    private AuthResponse buildAuthResponse(AuthRequest req,
                                           String email,
                                           String passwordHash,
                                           String roleName,
                                           Object domainUser) {

        email = require(email, "Email missing");
        roleName = Optional.ofNullable(roleName).orElse("UNKNOWN");

        authenticate(req.getEmail(), req.getPassword());

        var userDetails = buildUserDetails(email, passwordHash, roleName);
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", roleName);
        claims.put("email", email);

        String token = jwtService.generateToken(userDetails, email, claims);

        // Remove password if present via reflection-safe simple attempt
        try {
            var f = domainUser.getClass().getDeclaredField("password");
            f.setAccessible(true);
            f.set(domainUser, null);
        } catch (NoSuchFieldException | IllegalAccessException ignored) {}

        return AuthResponse.builder()
                .status("success")
                .token(token)
                .user(domainUser)
                .build();
    }

    private void authenticate(String rawEmail, String rawPassword) {
        String normalized = normalize(rawEmail);
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalized, rawPassword));
    }

    private User buildUserDetails(String email, String passwordHash, String roleName) {
        String authority = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
        return new User(email, passwordHash, List.of(new SimpleGrantedAuthority(authority)));
    }

    private String normalize(String e) {
        return e == null ? null : e.trim().toLowerCase();
    }

    private <T> T require(T v, String msg) {
        if (v == null) throw new UsernameNotFoundException(msg);
        return v;
    }
}