package com.hospital.repository;

import com.hospital.model.MedicalRecord;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/** MODEL (MVC): data access for the `medical_record` table. */
@Repository
public class MedicalRecordRepository {

    private static final RowMapper<MedicalRecord> MAPPER = (rs, rowNum) ->
            new MedicalRecord(rs.getLong("record_id"), rs.getLong("patient_id"),
                    rs.getLong("doctor_id"), rs.getObject("appointment_id", Long.class),
                    rs.getString("diagnosis"), rs.getString("prescription"), rs.getString("notes"));

    private final JdbcTemplate jdbc;

    public MedicalRecordRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Joined raw rows (patient/doctor names included) — same as the TS backend. */
    public List<Map<String, Object>> findAllRows() {
        return Rows.normalize(jdbc.queryForList("""
                SELECT m.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
                       d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
                  FROM medical_record m
                  JOIN patient p ON m.patient_id = p.patient_id
                  JOIN doctor d ON m.doctor_id = d.doctor_id
                 ORDER BY m.record_date DESC
                """));
    }

    public Map<String, Object> findRowById(Long id) {
        var rows = jdbc.queryForList("SELECT * FROM medical_record WHERE record_id = ?", id);
        return rows.isEmpty() ? null : Rows.normalize(rows.get(0));
    }

    public MedicalRecord findById(Long id) {
        var list = jdbc.query("SELECT * FROM medical_record WHERE record_id = ?", MAPPER, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public MedicalRecord requireById(Long id) {
        MedicalRecord m = findById(id);
        if (m == null) throw new NotFoundException("Medical record not found");
        return m;
    }

    public Long insert(MedicalRecord m) {
        jdbc.update("INSERT INTO medical_record (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?)",
                m.getPatientId(), m.getDoctorId(), m.getAppointmentId(),
                m.getDiagnosis(), m.getPrescription(), m.getNotes());
        return jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }

    public void update(Long id, MedicalRecord m) {
        jdbc.update("UPDATE medical_record SET patient_id = ?, doctor_id = ?, appointment_id = ?, diagnosis = ?, prescription = ?, notes = ? WHERE record_id = ?",
                m.getPatientId(), m.getDoctorId(), m.getAppointmentId(),
                m.getDiagnosis(), m.getPrescription(), m.getNotes(), id);
    }

    public void delete(Long id) {
        jdbc.update("DELETE FROM medical_record WHERE record_id = ?", id);
    }

    public long count() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM medical_record", Long.class);
    }
}
