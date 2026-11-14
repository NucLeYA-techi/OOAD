# Hms Backend (Java) — Hospital Management System

Java Spring Boot implementation of the same backend as `../backend`
(TypeScript). **Same MySQL schema, same API, same patterns** — plug-and-play
interchangeable. Kept side-by-side for the OO assignment comparison.

## MVC architecture (only)

| MVC layer | Where it lives |
|---|---|
| **Model** | `model/` entities (validation in constructors) + `repository/` (JdbcTemplate SQL) + `service/HospitalService` (business logic) |
| **View** | JSON responses — Spring/Jackson serializes return values; error shape `{"error": "..."}` via `exception/GlobalExceptionHandler` |
| **Controller** | `controller/` — thin `@RestController` classes, delegate to the service only |

Layers call in one direction: Controller → Service → Repository → MySQL.
Dependency direction (architecture): controllers depend on the service
interface of `HospitalService`; the service depends on repositories; no layer
knows about HTTP or JDBC details. The DataSource is a Spring-managed
**Singleton** (the Java equivalent of `DatabaseManager` in the TS backend).

## Design patterns (same 7 as the TS backend)

- **Singleton** — `config/DatabaseManager`: private constructor + private static
  `instance` field + `getInstance()` (the TS `DatabaseManager.instance()` equivalent).
  The DataSource pool behind it is Spring's container-managed singleton, so there
  is exactly one database handle for the whole app. (Spring's other beans —
  `@Service`, `@Repository`, `@Controller` — are singletons by default too.)
- **Factory/DI** — Spring constructor injection creates all components
- **Strategy** — `strategy/BookingValidationStrategy` (`StrictDoubleBookingStrategy`)
- **Observer** — `observer/AppointmentObserver` (`AuditLogger`, `NotificationService` via injected `List<AppointmentObserver>`)
- **Facade** — `service/HospitalService`
- **Template Method** — shared skeleton in service create/update flows
- **Adapter** — controllers adapt HTTP to the service; error handler adapts exceptions to JSON

## Run it

```bash
# from project root — Java backend comes up alongside db (port 5002)
docker compose --profile java up --build
curl http://localhost:5002/api/health
curl http://localhost:5002/api/stats
```

Local JVM (needs Maven):

```bash
mvn -DskipTests package
MYSQL_USERNAME=root MYSQL_PASSWORD=... java -jar target/hms-backend-java-1.0.0.jar
```

The React frontend keeps talking to the TS backend (port 5000) by default;
switch it any time with `VITE_BACKEND_URL=http://backend-java:5000` under the
frontend service.
