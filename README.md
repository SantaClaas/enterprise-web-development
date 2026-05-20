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