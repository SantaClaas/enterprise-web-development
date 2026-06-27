package com.yealch.yealch;

import com.yealch.yealch.user.User;
import com.yealch.yealch.user.UserRepository;
import jakarta.persistence.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class YealchApplication {

	private static final Logger logger = LoggerFactory.getLogger(YealchApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(YealchApplication.class, args);
	}

	@Bean
	public CommandLineRunner demo(UserRepository userRepository,
			org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
		return (args -> {
			logger.info("Let's inspect the beans provided by Spring Boot:");

			var user = new User();
			user.setName("Yealch");
			user.setUsername("yealch");
			user.setPassword(passwordEncoder.encode("password"));
			userRepository.save(user);

			logger.info("User saved with ID: {}", user.getId());

			userRepository.findAll().forEach(u -> logger.info("User: {}", u));
		});
	}

}
