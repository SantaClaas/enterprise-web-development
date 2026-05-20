# Time Track

[concept.pdf](https://santaclaas.github.io/enterprise-web-development/concept.pdf)

# Run

```bash
mvn spring-boot:run
```

or

```bash
./mvnw spring-boot:run
```

Vite dev server needs to accept incoming requests to the dev server

```bash
pnpm dev --host
```

# H2 Console

Access the H2 console at http://localhost:8080/h2-console. Use the following settings:

- Driver Class: org.h2.Driver
- JDBC URL: jdbc:h2:mem:testdb
- User Name: sa
- Password: (leave blank)

# TODO

- Refresh token in cookie that is only scoped to auth endpoints so that it is only sent when authentication is checked
- Handle login error
- Switch away from username password authentication to Passkey authentication
- User registration
- Get docker build up and running

# Must haves zum nächsten Mal

Wie notiert vom Dozenten:

- logout
- Zeiterfassung wesentliche funktionen (Grundzüge der Zeiterfassung)
