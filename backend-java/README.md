# HMS Backend (Java) — Hospital Management System

Java Spring Boot backend for the Hospital Management System.
MySQL schema lives in `../database/schema.sql`.

## MVC architecture

| MVC layer | Where it lives |
|---|---|
| **Model** | `model/` entities (validation in constructors) + `repository/` (JdbcTemplate SQL) + `service/HospitalService` (business logic) |
| **View** | JSON responses — Spring/Jackson serializes return values; error shape `{"error": "..."}` via `exception/GlobalExceptionHandler` |
| **Controller** | `controller/` — thin `@RestController` classes, delegate to the service only |

Layers call in one direction: Controller → Service → Repository → MySQL.
The DataSource is a Spring-managed **Singleton** wrapped by
`config/DatabaseManager`.

## Design patterns

- **Singleton** — `config/DatabaseManager`: private constructor + private static
  `instance` field + `getInstance()`.
- **Strategy** — `strategy/BookingValidationStrategy` (`StrictDoubleBookingStrategy`).
- **Observer** — `observer/AppointmentObserver` (`AuditLogger`, `NotificationService`
  injected as `List<AppointmentObserver>`).
- **Facade** — `service/HospitalService`.
- **Adapter** — controllers adapt HTTP to the service; error handler adapts
  exceptions to JSON.

Inheritance: `Person` (abstract) → `Doctor` / `Patient`.

## Run it

```bash
# from the project root — whole stack (db + Java backend + frontend)
docker compose up -d --build
curl http://localhost:5000/api/health
curl http://localhost:5000/api/stats
```

Local JVM (JDK 17 + Maven, MySQL running):

```bash
mvn -DskipTests package
java -jar target/hms-backend-java-1.0.0.jar
```
