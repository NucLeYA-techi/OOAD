package com.hospital.model;

/**
 * MODEL (MVC): Appointment entity — table `appointment`, with a real life
 * cycle (Unit II state chart):
 *        Scheduled ──> Completed
 *            │
 *            └───> Cancelled
 * Completed / Cancelled are terminal states; Scheduled -> Scheduled is illegal.
 */
public class Appointment {

    /** Lifecycle states (names match the SQL CHECK values exactly). */
    public enum Status {
        Scheduled, Completed, Cancelled;

        /** Parse a request string, or throw ValidationException (HTTP 400). */
        public static Status of(String value) {
            for (Status s : values()) {
                if (s.name().equalsIgnoreCase(value)) return s;
            }
            throw new ValidationException("status must be Scheduled, Completed or Cancelled.");
        }
    }

    private Long id;
    private Long patientId;
    private Long doctorId;
    private String date;
    private String time;
    private Status status;
    private String reason;

    public Appointment(Long id, Long patientId, Long doctorId, String date,
                       String time, Status status, String reason) {
        if (patientId == null || doctorId == null) {
            throw new ValidationException("patient_id and doctor_id are required.");
        }
        if (date == null || date.isBlank() || time == null || time.isBlank()) {
            throw new ValidationException("appointment_date and appointment_time are required.");
        }
        // Normalize HH:MM -> HH:MM:00 so Strategy comparisons match MySQL TIME values.
        if (time.matches("^\\d{2}:\\d{2}$")) time += ":00";
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.date = date;
        this.time = time;
        this.status = status == null ? Status.Scheduled : status;
        this.reason = reason;
    }

    public Long getId() { return id; }
    public Long getPatientId() { return patientId; }
    public Long getDoctorId() { return doctorId; }
    public String getDate() { return date; }
    public String getTime() { return time; }
    public Status getStatus() { return status; }
    public String getReason() { return reason; }

    /** Whether transitioning to `next` is legal from the current state. */
    public boolean canTransitionTo(Status next) {
        return status == Status.Scheduled && next != Status.Scheduled;
    }

    /** Apply a legal transition, or throw ValidationException. */
    public void changeStatus(Status next) {
        if (!canTransitionTo(next)) {
            throw new ValidationException("Illegal transition " + status + " -> " + next);
        }
        status = next;
    }
}
