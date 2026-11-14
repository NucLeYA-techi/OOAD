package com.hospital.repository;

import com.hospital.model.Doctor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * MODEL (MVC): data access for the `doctor` table.
 * List rows join the department name — the frontend shows it.
 */
@Repository
public class DoctorRepository {

    private static final String JOINED = """
            SELECT d.*, dep.department_name
              FROM doctor d
              JOIN department dep ON d.department_id = dep.department_id
            """;

    private static final RowMapper<Doctor> MAPPER = (rs, rowNum) ->
            new Doctor(rs.getLong("doctor_id"), rs.getString("first_name"), rs.getString("last_name"),
                    rs.getString("specialization"), rs.getString("phone"), rs.getString("email"),
                    rs.getDouble("consultation_fee"), rs.getLong("department_id"));

    private final JdbcTemplate jdbc;

    public DoctorRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Raw joined rows for the API (includes department_name). */
    public List<Map<String, Object>> findAllRows() {
        return Rows.normalize(jdbc.queryForList(JOINED + " ORDER BY d.doctor_id"));
    }

    public Map<String, Object> findRowById(Long id) {
        var rows = jdbc.queryForList(JOINED + " WHERE d.doctor_id = ?", id);
        return rows.isEmpty() ? null : Rows.normalize(rows.get(0));
    }

    public Doctor findById(Long id) {
        var list = jdbc.query("SELECT * FROM doctor WHERE doctor_id = ?", MAPPER, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public Doctor requireById(Long id) {
        Doctor d = findById(id);
        if (d == null) throw new NotFoundException("Doctor not found");
        return d;
    }

    public Long insert(Doctor d) {
        jdbc.update("INSERT INTO doctor (first_name, last_name, specialization, phone, email, consultation_fee, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                d.getFirstName(), d.getLastName(), d.getSpecialization(), d.getPhone(),
                d.getEmail(), d.getConsultationFee(), d.getDepartmentId());
        return jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    public void update(Long id, Doctor d) {
        jdbc.update("UPDATE doctor SET first_name = ?, last_name = ?, specialization = ?, phone = ?, email = ?, consultation_fee = ?, department_id = ? WHERE doctor_id = ?",
                d.getFirstName(), d.getLastName(), d.getSpecialization(), d.getPhone(),
                d.getEmail(), d.getConsultationFee(), d.getDepartmentId(), id);
    }

    public void delete(Long id) {
        jdbc.update("DELETE FROM doctor WHERE doctor_id = ?", id);
    }

    public long count() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM doctor", Long.class);
    }
}
