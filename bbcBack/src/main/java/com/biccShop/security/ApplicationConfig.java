package com.biccShop.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.biccShop.dao.AdminDA;
import com.biccShop.dao.CustomerDA;
import com.biccShop.dao.SellerDA;


@Configuration
public class ApplicationConfig {
	
	// Removed @Autowired DAO fields to break circular dependency
	
//	@Bean
//	AuthProvider authProvider(AdminDA adminDA, CustomerDA customerDA, SellerDA sellerDA, PasswordEncoder passwordEncoder) {
//		AuthProvider authProvider = new AuthProvider(userDetailsService(adminDA, customerDA, sellerDA), passwordEncoder);
//		return authProvider;
//	}
	
	@Bean
	UserDetailsService userDetailsService(AdminDA adminDA, CustomerDA customerDA, SellerDA sellerDA) {
		return new UserDetailsService() {
			@Override
			public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
				UserDetails u = null;
				u = adminDA.findByEmail(username);
				if(u == null) {
					u = customerDA.findByEmail(username);
				}
				if(u == null) {
					u = sellerDA.findByEmail(username);
				}
				if(u == null) {
					throw new UsernameNotFoundException("User not found: " + username);
				}
				return u;
			}
		};
	}

	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}
	
	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
