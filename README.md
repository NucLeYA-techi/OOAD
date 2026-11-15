# Hospital Management System (HMS) — DBMS Project

> Based on `dbms_rep (1).pdf` — Database Project Report, RIT, 24CSL47.
> **MySQL 8 (3NF schema) + Java Spring Boot (MVC) REST API + React/Vite SPA.**

## One command

```bash
docker compose up -d --build
```

| Service | Port | URL |
|---|---|---|
| **Frontend (React UI)** | **5173** | **http://localhost:5173** |
| Backend (Java Spring Boot API) | 5000 | http://localhost:5000/api/health |
| MySQL | 3307 | `mysql -h 127.0.0.1 -P 3307 -u root -phmsroot` |

Stop: `docker compose down` (add `-v` to also wipe the database volume).
The schema + seed data auto-load on first start.

## Project structure

```
dbms/
├── README.md
├── docker-compose.yml          # db + Java backend + frontend
├── database/
│   ├── schema.sql              # DDL: 5 tables, FKs, CHECKs, UNIQUE, indexes + seed DML
│   └── ER-Diagram.md           # ER + relational design + normalization notes
├── backend-java/               # Spring Boot backend — MVC + design patterns (default)
├── backend/                    # original JavaScript (Express + mysql2) backend (optional)
└── frontend/                   # React + Vite
```

## Backend (Java, Spring Boot — MVC)

```
backend-java/src/main/java/com/hospital/
├── HospitalApplication.java       entry point (Spring Boot)
├── config/DatabaseManager.java    Singleton — one shared database handle
├── model/                         MODEL: Person (abstract) → Doctor / Patient,
│                                  Department, Appointment, MedicalRecord
├── repository/                    MODEL (data access): 5 JdbcTemplate repositories
├── strategy/                      Strategy: BookingValidationStrategy + StrictDoubleBooking
├── observer/                      Observer: AuditLogger, NotificationService
├── service/HospitalService.java    MODEL (logic): Facade over repositories
├── controller/                    CONTROLLER: 6 REST controllers (thin)
└── exception/                     error → JSON mapping (400/404/409/500)
```

Layer direction: **controller → service → repository → MySQL**. No SQL in
controllers, no HTTP in the service.

Design patterns: **Singleton** (`DatabaseManager`), **Factory/DI** (Spring
constructor injection), **Strategy** (double-booking policy), **Observer**
(audit + notification on status change), **Facade** (`HospitalService`),
**Adapter** (controllers adapt HTTP to the service). Inheritance:
`Person` → `Doctor`/`Patient`.

## Original JavaScript backend (optional)

The first version of the backend is kept as-is in `backend/` (Express + mysql2,
plain JavaScript, one router per table). It is **not started by default**:

```bash
docker compose --profile js up -d backend-js    # http://localhost:5001
```

Run it locally: `cd backend && npm install && npm run dev` (uses `.env`, see
`backend/.env.example`).

## Modules (5 entities)

| Entity | Key rules |
|---|---|
| `department` | `department_name UNIQUE`; cannot delete while doctors assigned (`ON DELETE RESTRICT`) |
| `doctor` | `email UNIQUE`, `consultation_fee >= 0`, `department_id FK → department` |
| `patient` | `email UNIQUE`, `gender`, `blood_group` CHECKs |
| `appointment` | `UNIQUE(doctor_id, appointment_date, appointment_time)` — prevents double-booking; `status CHECK (Scheduled/Completed/Cancelled)`; `ON DELETE CASCADE` from patient/doctor |
| `medical_record` | links `patient_id`, `doctor_id`, optional `appointment_id (ON DELETE SET NULL)` |

Schema is normalized to **3NF** (see `database/ER-Diagram.md`).

## API (base `http://localhost:5000/api`)

| Method | Route | Description |
|---|---|---|
| GET | `/health` | health check |
| GET | `/stats` | counts per table + upcoming appointments |
| GET/POST | `/departments` | list / create |
| GET/PUT/DELETE | `/departments/:id` | read / update / delete |
| GET/POST | `/doctors` | list (joined with department) / create |
| GET/PUT/DELETE | `/doctors/:id` | read / update / delete |
| GET/POST | `/patients` | list / create |
| GET/PUT/DELETE | `/patients/:id` | read / update / delete (cascades appointments/records) |
| GET/POST | `/appointments` | list (joined patient+doctor) / create (409 on double-book) |
| GET/PUT/DELETE | `/appointments/:id` | read / update / delete |
| PATCH | `/appointments/:id/status` | change status (400 on illegal transition) |
| GET/POST | `/medical-records` | list (joined) / create |
| GET/PUT/DELETE | `/medical-records/:id` | read / update / delete |

All queries use `?` placeholders (JDBC PreparedStatement) — no string
interpolation (SQL-injection safe).

## Manual run (without Docker)

```bash
# 1. Database
mysql -u root -p -e "CREATE DATABASE hospital_management;"
mysql -u root -p hospital_management < database/schema.sql

# 2. Java backend (JDK 17 + Maven)
cd backend-java && mvn -DskipTests package && java -jar target/hms-backend-java-1.0.0.jar

# 3. Frontend
cd frontend && npm install && npm run dev   # http://localhost:5173
```
