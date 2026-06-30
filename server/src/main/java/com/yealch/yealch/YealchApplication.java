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

			// Seed 25 organizations (page size is 20, so this triggers a second page)
			String[] orgNames = {
				"Alpha Corp", "Beta Labs", "Gamma Inc", "Delta Studio", "Epsilon Works",
				"Zeta Design", "Eta Group", "Theta Solutions", "Iota Agency", "Kappa Digital",
				"Lambda Tech", "Mu Creative", "Nu Ventures", "Xi Partners", "Omicron Media",
				"Pi Consulting", "Rho Systems", "Sigma Network", "Tau Industries", "Upsilon Co",
				"Phi Software", "Chi Services", "Psi Analytics", "Omega Collective", "Prime Studio",
			};

			// First org gets multiple projects to push the projects list past page size 20
			var firstOrg = new Organization();
			firstOrg.setName(orgNames[0]);
			firstOrg.addMember(user, OrganizationRole.OWNER);
			for (int p = 1; p <= 22; p++) {
				var project = new Project();
				project.setName("Project " + p);
				firstOrg.addProject(project);
			}
			organizationRepository.save(firstOrg);
			Project seedProject = firstOrg.getProjects().iterator().next();

			// Remaining orgs each get 1 project
			for (int i = 1; i < orgNames.length; i++) {
				var org = new Organization();
				org.setName(orgNames[i]);
				org.addMember(user, OrganizationRole.OWNER);
				var project = new Project();
				project.setName(orgNames[i] + " Project");
				org.addProject(project);
				organizationRepository.save(org);
			}

			// Seed 60 days of time entries (2–3 entries per day → ~150 entries, 5 pages)
			OffsetDateTime base = OffsetDateTime.now(ZoneOffset.UTC).withHour(0).withMinute(0).withSecond(0).withNano(0);
			int[][] slots = {
				{ 9, 0, 11, 30 },
				{ 12, 30, 14, 0 },
				{ 15, 0, 17, 45 },
			};

			for (int day = 0; day < 60; day++) {
				OffsetDateTime date = base.minusDays(day);
				int entriesThisDay = (day % 3 == 0) ? 3 : 2;
				for (int s = 0; s < entriesThisDay; s++) {
					int[] slot = slots[s];
					var time = new Time();
					time.setStart(date.withHour(slot[0]).withMinute(slot[1]));
					time.setEnd(date.withHour(slot[2]).withMinute(slot[3]));
					time.setProject(seedProject);
					timeRepository.save(time);
				}
			}

			logger.info("Seeded {} organizations, ~{} projects, ~150 time entries for user '{}'",
					orgNames.length, orgNames.length + 21, user.getUsername());
		});
	}
}
