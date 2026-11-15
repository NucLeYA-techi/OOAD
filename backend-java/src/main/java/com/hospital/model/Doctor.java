package com.hospital.model;

/**
 * MODEL (MVC): Doctor — table `doctor`.
 *
 * Generalization: Doctor IS-A Person (id, names, phone, e-mail inherited).
 * It adds the doctor-specific state (specialization, fee, department).
 * References its department by id (association many-to-one, role: employs).
 */
public class Doctor extends Person {

    private final String specialization;
    private final double consultationFee;
    private final Long departmentId;

    public Doctor(Long id, String firstName, String lastName, String specialization,
                  String phone, String email, double consultationFee, Long departmentId) {
        super(id, firstName, lastName, phone, email);
        if (email == null || !email.contains("@")) {
            throw new ValidationException("A valid email is required.");
        }
        if (consultationFee < 0) {
            throw new ValidationException("consultation_fee cannot be negative.");
        }
        if (departmentId == null) {
            throw new ValidationException("department_id is required.");
        }
        this.specialization = specialization == null ? "" : specialization;
        this.consultationFee = consultationFee;
        this.departmentId = departmentId;
    }

    public String getSpecialization() { return specialization; }
    public double getConsultationFee() { return consultationFee; }
    public Long getDepartmentId() { return departmentId; }
}
