# ER Diagram & Relational Design

## Entities & Relationships

```
DEPARTMENT (1) ────< (N) DOCTOR (1) ────< (N) APPOINTMENT (N) >──── (1) PATIENT
                                                      │
                                                      │ 1
                                                      │
                                                      │ (N)
                                                MEDICAL_RECORD
```

| Relationship | Type | Notes |
|---|---|---|
| DEPARTMENT → DOCTOR | 1 : N | A doctor belongs to exactly one department; deleting a department with doctors is RESTRICTED |
| PATIENT → APPOINTMENT | 1 : N | Deleting a patient CASCADES to their appointments |
| DOCTOR → APPOINTMENT | 1 : N | Deleting a doctor CASCADES to their appointments |
| (PATIENT, DOCTOR, APPOINTMENT) → MEDICAL_RECORD | N : 1 | `appointment_id` optional; deleting an appointment sets it NULL |
| DOCTOR (date, time) | UNIQUE | Prevents double-booking the same doctor |

## Relational schema (3NF)

- **department**(`department_id` PK, `department_name` UQ, `location`, `phone`)
- **doctor**(`doctor_id` PK, `first_name`, `last_name`, `specialization`, `phone`, `email` UQ, `consultation_fee`, `department_id` FK→department)
- **patient**(`patient_id` PK, `first_name`, `last_name`, `date_of_birth`, `gender`, `phone`, `email` UQ, `address`, `blood_group`)
- **appointment**(`appointment_id` PK, `patient_id` FK→patient, `doctor_id` FK→doctor, `appointment_date`, `appointment_time`, `status`, `reason`, `created_at`, UQ(`doctor_id`,`appointment_date`,`appointment_time`))
- **medical_record**(`record_id` PK, `patient_id` FK→patient, `doctor_id` FK→doctor, `appointment_id` FK→appointment NULL, `diagnosis`, `prescription`, `notes`, `record_date`)

## Normalization (summary, per report §8)

- **1NF:** atomic values, one row per entity, single-column PKs.
- **2NF:** no composite PKs → every non-key attribute fully depends on the PK (names are not copied into appointment).
- **3NF:** no transitive dependencies — `department.location/phone` live only in `department`, referenced via `doctor.department_id` FK.
