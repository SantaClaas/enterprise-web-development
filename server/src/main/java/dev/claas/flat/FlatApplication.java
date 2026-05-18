package dev.claas.flat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class FlatApplication {

	public static void main(String[] args) {
		SpringApplication.run(FlatApplication.class, args);
	}

	// No version in url as there will only be one version ever
	@GetMapping("/api/hello")
	public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
		return String.format("Hello %s!", name);
	}

}

// @Entity
// class User {

// }
