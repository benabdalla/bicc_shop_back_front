package com.biccShop.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

	@Autowired
	JwtService jwtService;

	@Autowired
	UserDetailsService userDetailsService;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		// java.util.Enumeration<String> headerNames = request.getHeaderNames();
		// while (headerNames.hasMoreElements()) {
		// String headerName = headerNames.nextElement();
		// String headerValue = request.getHeader(headerName);
		// System.out.println(headerName + ": " + headerValue);
		// }

		final String authHeader = request.getHeader("Authorization");
		final String jwt;
		final String userEmail;

		// if header is not valid we doFilter and return
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		// Check if this is a whitelisted endpoint for uploads
		String requestURI = request.getRequestURI();
		if (requestURI.equals("/upload") || requestURI.startsWith("/uploads/")) {
			// For upload endpoints, continue without JWT validation
			filterChain.doFilter(request, response);
			return;
		}

		// if header is valid bearer then extract token and validate
		jwt = authHeader.substring(7);
		try {
			userEmail = jwtService.extractUsername(jwt);
			if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				// check if user available in database
				UserDetails userDetails = null;
				try {
					userDetails = userDetailsService.loadUserByUsername(userEmail);
				} catch (Exception e) {

				}
				// validating token
				if (jwtService.isTokenValid(jwt, userDetails)) {
					// building authToken
					UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
							null, userDetails.getAuthorities());
					authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					// setting authToken to securityContextHolder
					SecurityContextHolder.getContext().setAuthentication(authToken);
				}
			}
		} catch (io.jsonwebtoken.ExpiredJwtException e) {
			// JWT token is expired, but continue with the request
			// This allows the security configuration to handle authorization
			System.out.println("JWT token expired for request: " + requestURI + ", continuing without authentication");
		} catch (Exception e) {
			// Other JWT parsing errors, log and continue
			System.out.println("JWT parsing error for request: " + requestURI + ", error: " + e.getMessage());
		}
		filterChain.doFilter(request, response);
	}

}
