package com.yealch.yealch;

import com.yealch.yealch.organization.Organization;
import com.yealch.yealch.organization.OrganizationRepository;
import com.yealch.yealch.organization.OrganizationRole;
import com.yealch.yealch.project.Project;
import com.yealch.yealch.project.ProjectRepository;
import com.yealch.yealch.time.Time;
import com.yealch.yealch.time.TimeRepository;
import com.yealch.yealch.user.User;
import com.yealch.yealch.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@SpringBootApplication
public class YealchApplication {

	private static final Logger logger = LoggerFactory.getLogger(YealchApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(YealchApplication.class, args);
	}

	@Bean
	public CommandLineRunner demo(
			UserRepository userRepository,
			OrganizationRepository organizationRepository,
			ProjectRepository projectRepository,
			TimeRepository timeRepository,
			org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
		return (args -> {
			var user = new User();
			user.setName("Yealch");
			user.setUsername("yealch");
			user.setPassword(passwordEncoder.encode("password"));
			userRepository.save(user);

			var organization = new Organization();
			organization.setName("Yealch Organization");
			organization.addMember(user, OrganizationRole.OWNER);

			var project = new Project();
			project.setName("Main Project");
			organization.addProject(project);
			organizationRepository.save(organization);

			// Seed 30 days of time entries (2–3 entries per day)
			OffsetDateTime base = OffsetDateTime.now(ZoneOffset.UTC).withHour(0).withMinute(0).withSecond(0).withNano(0);
			int[][] slots = {
				{ 9, 0, 11, 30 },
				{ 12, 30, 14, 0 },
				{ 15, 0, 17, 45 },
			};

			for (int day = 0; day < 30; day++) {
				OffsetDateTime date = base.minusDays(day);
				int entriesThisDay = (day % 3 == 0) ? 3 : 2;
				for (int s = 0; s < entriesThisDay; s++) {
					int[] slot = slots[s];
					var time = new Time();
					time.setStart(date.withHour(slot[0]).withMinute(slot[1]));
					time.setEnd(date.withHour(slot[2]).withMinute(slot[3]));
					time.setProject(project);
					timeRepository.save(time);
				}
			}

			logger.info("Seeded 30 days of time entries for user '{}'", user.getUsername());
		});
	}
}
