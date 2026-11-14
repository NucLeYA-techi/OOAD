package com.hospital.repository;

import com.hospital.model.Patient;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/** MODEL (MVC): data access for the `patient` table. */
@Repository
public class PatientRepository {

    private static final RowMapper<Patient> MAPPER = (rs, rowNum) ->
            new Patient(rs.getLong("patient_id"), rs.getString("first_name"), rs.getString("last_name"),
                    rs.getString("date_of_birth"), rs.getString("gender"), rs.getString("phone"),
                    rs.getString("email"), rs.getString("address"), rs.getString("blood_group"));

    private final JdbcTemplate jdbc;

    public PatientRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Raw rows for the API. */
    public List<Map<String, Object>> findAllRows() {
        return Rows.normalize(jdbc.queryForList("SELECT * FROM patient ORDER BY patient_id"));
    }

    public Map<String, Object> findRowById(Long id) {
        var rows = jdbc.queryForList("SELECT * FROM patient WHERE patient_id = ?", id);
        return rows.isEmpty() ? null : Rows.normalize(rows.get(0));
    }

    public Patient findById(Long id) {
        var list = jdbc.query("SELECT * FROM patient WHERE patient_id = ?", MAPPER, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public Patient requireById(Long id) {
        Patient p = findById(id);
        if (p == null) throw new NotFoundException("Patient not found");
        return p;
    }

    public Long insert(Patient p) {
        jdbc.update("INSERT INTO patient (first_name, last_name, date_of_birth, gender, phone, email, address, blood_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                p.getFirstName(), p.getLastName(), p.getDateOfBirth(), p.getGender(), p.getPhone(),
                p.getEmail(), p.getAddress(), p.getBloodGroup());
        return jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    public void update(Long id, Patient p) {
        jdbc.update("UPDATE patient SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, phone = ?, email = ?, address = ?, blood_group = ? WHERE patient_id = ?",
                p.getFirstName(), p.getLastName(), p.getDateOfBirth(), p.getGender(), p.getPhone(),
                p.getEmail(), p.getAddress(), p.getBloodGroup(), id);
    }

    public void delete(Long id) {
        jdbc.update("DELETE FROM patient WHERE patient_id = ?", id);
    }

    public long count() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM patient", Long.class);
    }
}
