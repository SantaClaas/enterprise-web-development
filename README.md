# Time Track

[concept.pdf](https://santaclaas.github.io/enterprise-web-development/concept.pdf)

# Run

```bash
mvn spring-boot:run
```

<!-- Compile is mvn compile? -->

or

```bash
./mvnw spring-boot:run
```

Vite dev server needs to accept incoming requests to the dev server

```bash
pnpm dev --host
```

# End to End Tests

End to end tests use [Playwright](https://playwright.dev) and are located in `client/e2e/`.

**Prerequisites:** the backend must be running on port 8080 before starting the tests (see [Run](#run) above).

Run the tests headlessly:

```bash
cd client
pnpm test:e2e
```

Open the Playwright UI to watch tests run and inspect traces:

```bash
cd client
pnpm test:e2e:ui
```

The first run automatically starts the Vite dev server and creates a test user. Saved browser auth state is written to `client/e2e/.auth/user.json` (gitignored).

`data-testid` attributes used by the tests are stripped from production builds automatically.

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
- Check out minikube for local kubernetes cluster or in docker desktop

# Must haves zum nächsten Mal

Wie notiert vom Dozenten:

- logout
- Zeiterfassung wesentliche funktionen (Grundzüge der Zeiterfassung)
