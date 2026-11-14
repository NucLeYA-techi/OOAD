package com.hospital.model;

/**
 * MODEL (MVC): MedicalRecord entity — table `medical_record`.
 * References Patient, Doctor and (optionally) Appointment by id.
 */
public class MedicalRecord {

    private Long id;
    private Long patientId;
    private Long doctorId;
    private Long appointmentId;
    private String diagnosis;
    private String prescription;
    private String notes;

    public MedicalRecord(Long id, Long patientId, Long doctorId, Long appointmentId,
                         String diagnosis, String prescription, String notes) {
        if (patientId == null || doctorId == null) {
            throw new ValidationException("patient_id and doctor_id are required.");
        }
        if (diagnosis == null || diagnosis.isBlank()) {
            throw new ValidationException("diagnosis is required.");
        }
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentId = appointmentId;
        this.diagnosis = diagnosis;
        this.prescription = prescription;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public Long getPatientId() { return patientId; }
    public Long getDoctorId() { return doctorId; }
    public Long getAppointmentId() { return appointmentId; }
    public String getDiagnosis() { return diagnosis; }
    public String getPrescription() { return prescription; }
    public String getNotes() { return notes; }
}
