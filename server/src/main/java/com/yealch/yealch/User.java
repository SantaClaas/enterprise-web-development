package com.yealch.yealch;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false, unique = true)
	private String username;

	@Column(nullable = false)
	private String password;

	@ManyToMany(mappedBy = "users")
	private Set<Organization> organizations = new HashSet<>();

	public Long getId() {
		return id;
	}

	public Set<Organization> getOrganizations() {
		return organizations;
	}

	public void addOrganization(Organization organization) {
		organizations.add(organization);
		organization.getUsers().add(this);
	}

	public void removeOrganization(Organization organization) {
		organizations.remove(organization);
		organization.getUsers().remove(this);
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
}
