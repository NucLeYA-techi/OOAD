package com.hospital.repository;

import com.hospital.model.Appointment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/** MODEL (MVC): data access for the `appointment` table. */
@Repository
public class AppointmentRepository {

    private static final String JOINED = """
            SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
                   d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
                   d.specialization
              FROM appointment a
              JOIN patient p ON a.patient_id = p.patient_id
              JOIN doctor d ON a.doctor_id = d.doctor_id
            """;

    private static final RowMapper<Appointment> MAPPER = (rs, rowNum) ->
            new Appointment(rs.getLong("appointment_id"), rs.getLong("patient_id"),
                    rs.getLong("doctor_id"), rs.getString("appointment_date"),
                    rs.getString("appointment_time"), Appointment.Status.of(rs.getString("status")),
                    rs.getString("reason"));

    private final JdbcTemplate jdbc;

    public AppointmentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Joined raw rows — same JSON shape as the TypeScript backend. */
    public List<Map<String, Object>> findAllRows() {
        return Rows.normalize(jdbc.queryForList(
                JOINED + " ORDER BY a.appointment_date DESC, a.appointment_time DESC"));
    }

    public Map<String, Object> findRowById(Long id) {
        var rows = jdbc.queryForList(JOINED + " WHERE a.appointment_id = ?", id);
        if (rows.isEmpty()) throw new NotFoundException("Appointment not found");
        return Rows.normalize(rows.get(0));
    }

    public Appointment findById(Long id) {
        var list = jdbc.query("SELECT * FROM appointment WHERE appointment_id = ?", MAPPER, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public Appointment requireById(Long id) {
        Appointment a = findById(id);
        if (a == null) throw new NotFoundException("Appointment not found");
        return a;
    }

    /** Plain list — used by the double-booking Strategy. */
    public List<Appointment> findAll() {
        return jdbc.query("SELECT * FROM appointment ORDER BY appointment_id", MAPPER);
    }

    public Long insert(Appointment a) {
        jdbc.update("INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES (?, ?, ?, ?, ?, ?)",
                a.getPatientId(), a.getDoctorId(), a.getDate(), a.getTime(),
                a.getStatus().name(), a.getReason());
        return jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    public void update(Long id, Appointment a) {
        jdbc.update("UPDATE appointment SET patient_id = ?, doctor_id = ?, appointment_date = ?, appointment_time = ?, status = ?, reason = ? WHERE appointment_id = ?",
                a.getPatientId(), a.getDoctorId(), a.getDate(), a.getTime(),
                a.getStatus().name(), a.getReason(), id);
    }

    public void updateStatus(Long id, Appointment.Status status) {
        jdbc.update("UPDATE appointment SET status = ? WHERE appointment_id = ?", status.name(), id);
    }

    public void delete(Long id) {
        jdbc.update("DELETE FROM appointment WHERE appointment_id = ?", id);
    }

    public long count() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM appointment", Long.class);
    }

    public List<Map<String, Object>> findUpcoming(int limit) {
        return Rows.normalize(jdbc.queryForList(
                "SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status, " +
                "p.first_name AS patient, d.first_name AS doctor, d.specialization " +
                "FROM appointment a JOIN patient p ON a.patient_id = p.patient_id " +
                "JOIN doctor d ON a.doctor_id = d.doctor_id " +
                "WHERE a.status = 'Scheduled' ORDER BY a.appointment_date, a.appointment_time LIMIT ?",
                limit));
    }
}
