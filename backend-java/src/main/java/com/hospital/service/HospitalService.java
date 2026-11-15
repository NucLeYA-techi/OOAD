package com.hospital.service;

import com.hospital.model.*;
import com.hospital.observer.AppointmentObserver;
import com.hospital.repository.*;
import com.hospital.strategy.BookingValidationStrategy;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * MODEL (MVC): business logic — the Facade of the design.
 * Controllers call only this service. The service owns its five repositories
 * (composition), holds the booking Strategy (injected) and is the Observer
 * Subject for status changes. Read methods return raw snake_case rows.
 */
@Service
public class HospitalService {

    private final DepartmentRepository departments;
    private final DoctorRepository doctors;
    private final PatientRepository patients;
    private final AppointmentRepository appointments;
    private final MedicalRecordRepository records;
    private final BookingValidationStrategy strategy;
    private final List<AppointmentObserver> observers;

    public HospitalService(DepartmentRepository departments, DoctorRepository doctors,
                           PatientRepository patients, AppointmentRepository appointments,
                           MedicalRecordRepository records, BookingValidationStrategy strategy,
                           List<AppointmentObserver> observers) {
        this.departments = departments;
        this.doctors = doctors;
        this.patients = patients;
        this.appointments = appointments;
        this.records = records;
        this.strategy = strategy;
        this.observers = observers;
    }

    private void notifyStatusChanged(Long id, String from, String to) {
        for (AppointmentObserver observer : observers) {
            observer.onStatusChanged(id, from, to);
        }
    }

    // --- small coercion helpers for request bodies (Map<String, Object>) ---
    private static String str(Map<String, Object> body, String key) {
        Object v = body.get(key);
        return v == null ? null : String.valueOf(v);
    }

    private static Long num(Map<String, Object> body, String key) {
        Object v = body.get(key);
        if (v == null) return null;
        if (v instanceof Number n) return n.longValue();
        return Long.parseLong(String.valueOf(v).trim());
    }

    private static double numDouble(Map<String, Object> body, String key) {
        Object v = body.get(key);
        if (v == null) return 0.0;
        if (v instanceof Number n) return n.doubleValue();
        return Double.parseDouble(String.valueOf(v).trim());
    }

    // --- Departments ----------------------------------------------------------
    public List<Map<String, Object>> listDepartments() {
        return departments.findAllRows();
    }

    public Map<String, Object> getDepartment(Long id) {
        departments.requireById(id);
        return departments.findRowById(id);
    }

    public Map<String, Object> createDepartment(Map<String, Object> body) {
        Department d = new Department(null, str(body, "department_name"), str(body, "location"), str(body, "phone"));
        return departments.findRowById(departments.insert(d));
    }

    public Map<String, Object> updateDepartment(Long id, Map<String, Object> body) {
        departments.requireById(id);
        departments.update(id, new Department(id, str(body, "department_name"), str(body, "location"), str(body, "phone")));
        return departments.findRowById(id);
    }

    public Map<String, Object> deleteDepartment(Long id) {
        departments.requireById(id);
        departments.delete(id);
        return Map.of("message", "Department deleted successfully");
    }

    // --- Doctors ---------------------------------------------------------------
    public List<Map<String, Object>> listDoctors() {
        return doctors.findAllRows();
    }

    public Map<String, Object> getDoctor(Long id) {
        doctors.requireById(id);
        return doctors.findRowById(id);
    }

    public Map<String, Object> createDoctor(Map<String, Object> body) {
        Doctor d = new Doctor(null, str(body, "first_name"), str(body, "last_name"),
                str(body, "specialization"), str(body, "phone"), str(body, "email"),
                numDouble(body, "consultation_fee"), num(body, "department_id"));
        return doctors.findRowById(doctors.insert(d));
    }

    public Map<String, Object> updateDoctor(Long id, Map<String, Object> body) {
        doctors.requireById(id);
        doctors.update(id, new Doctor(id, str(body, "first_name"), str(body, "last_name"),
                str(body, "specialization"), str(body, "phone"), str(body, "email"),
                numDouble(body, "consultation_fee"), num(body, "department_id")));
        return doctors.findRowById(id);
    }

    public Map<String, Object> deleteDoctor(Long id) {
        doctors.requireById(id);
        doctors.delete(id);
        return Map.of("message", "Doctor deleted successfully");
    }

    // --- Patients ---------------------------------------------------------------
    public List<Map<String, Object>> listPatients() {
        return patients.findAllRows();
    }

    public Map<String, Object> getPatient(Long id) {
        patients.requireById(id);
        return patients.findRowById(id);
    }

    public Map<String, Object> createPatient(Map<String, Object> body) {
        Patient p = new Patient(null, str(body, "first_name"), str(body, "last_name"),
                str(body, "date_of_birth"), str(body, "gender"), str(body, "phone"),
                str(body, "email"), str(body, "address"), str(body, "blood_group"));
        return patients.findRowById(patients.insert(p));
    }

    public Map<String, Object> updatePatient(Long id, Map<String, Object> body) {
        patients.requireById(id);
        patients.update(id, new Patient(id, str(body, "first_name"), str(body, "last_name"),
                str(body, "date_of_birth"), str(body, "gender"), str(body, "phone"),
                str(body, "email"), str(body, "address"), str(body, "blood_group")));
        return patients.findRowById(id);
    }

    public Map<String, Object> deletePatient(Long id) {
        patients.requireById(id);
        patients.delete(id);
        return Map.of("message", "Patient deleted successfully (appointments & records cascaded)");
    }

    // --- Appointments -----------------------------------------------------------
    public List<Map<String, Object>> listAppointments() {
        return appointments.findAllRows();
    }

    public Map<String, Object> getAppointment(Long id) {
        return appointments.findRowById(id);
    }

    /** Main flow: validate with the injected Strategy, then persist. */
    public Map<String, Object> createAppointment(Map<String, Object> body) {
        Appointment candidate = new Appointment(null, num(body, "patient_id"), num(body, "doctor_id"),
                str(body, "appointment_date"), str(body, "appointment_time"),
                body.get("status") == null ? null : Appointment.Status.of(str(body, "status")),
                str(body, "reason"));
        strategy.isValid(candidate); // throws ConflictException on double-booking
        return appointments.findRowById(appointments.insert(candidate));
    }

    public Map<String, Object> updateAppointment(Long id, Map<String, Object> body) {
        appointments.requireById(id);
        appointments.update(id, new Appointment(id, num(body, "patient_id"), num(body, "doctor_id"),
                str(body, "appointment_date"), str(body, "appointment_time"),
                Appointment.Status.of(str(body, "status")), str(body, "reason")));
        return appointments.findRowById(id);
    }

    /**
     * Alternate flow: the Appointment state machine rejects illegal
     * transitions; legal ones notify every attached Observer.
     */
    public Map<String, Object> setAppointmentStatus(Long id, String statusText) {
        Appointment.Status target = Appointment.Status.of(statusText);
        Appointment current = appointments.requireById(id);
        Appointment.Status from = current.getStatus();
        current.changeStatus(target); // throws ValidationException when illegal
        appointments.updateStatus(id, target);
        notifyStatusChanged(id, from.name(), target.name());
        return appointments.findRowById(id);
    }

    public Map<String, Object> deleteAppointment(Long id) {
        appointments.requireById(id);
        appointments.delete(id);
        return Map.of("message", "Appointment deleted successfully");
    }

    // --- Medical records ----------------------------------------------------------
    public List<Map<String, Object>> listMedicalRecords() {
        return records.findAllRows();
    }

    public Map<String, Object> getMedicalRecord(Long id) {
        records.requireById(id);
        return records.findRowById(id);
    }

    public Map<String, Object> createMedicalRecord(Map<String, Object> body) {
        MedicalRecord m = new MedicalRecord(null, num(body, "patient_id"), num(body, "doctor_id"),
                num(body, "appointment_id"), str(body, "diagnosis"),
                str(body, "prescription"), str(body, "notes"));
        return records.findRowById(records.insert(m));
    }

    public Map<String, Object> updateMedicalRecord(Long id, Map<String, Object> body) {
        records.requireById(id);
        records.update(id, new MedicalRecord(id, num(body, "patient_id"), num(body, "doctor_id"),
                num(body, "appointment_id"), str(body, "diagnosis"),
                str(body, "prescription"), str(body, "notes")));
        return records.findRowById(id);
    }

    public Map<String, Object> deleteMedicalRecord(Long id) {
        records.requireById(id);
        records.delete(id);
        return Map.of("message", "Medical record deleted successfully");
    }

    // --- Stats (dashboard) -----------------------------------------------------------
    public Map<String, Object> stats() {
        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("department", departments.count());
        counts.put("doctor", doctors.count());
        counts.put("patient", patients.count());
        counts.put("appointment", appointments.count());
        counts.put("medical_record", records.count());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("counts", counts);
        result.put("upcoming", appointments.findUpcoming(10));
        return result;
    }
}
