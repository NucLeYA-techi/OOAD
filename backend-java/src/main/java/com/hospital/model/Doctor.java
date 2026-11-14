package com.hospital.model;

/**
 * MODEL (MVC): Doctor entity — table `doctor`.
 * References its department by id (association many-to-one, role: employs).
 */
public class Doctor {

    private Long id;
    private String firstName;
    private String lastName;
    private String specialization;
    private String phone;
    private String email;
    private double consultationFee;
    private Long departmentId;

    public Doctor(Long id, String firstName, String lastName, String specialization,
                  String phone, String email, double consultationFee, Long departmentId) {
        if (firstName == null || firstName.isBlank() || lastName == null || lastName.isBlank()) {
            throw new ValidationException("first_name and last_name are required.");
        }
        if (email == null || !email.contains("@")) {
            throw new ValidationException("A valid email is required.");
        }
        if (consultationFee < 0) {
            throw new ValidationException("consultation_fee cannot be negative.");
        }
        if (departmentId == null) {
            throw new ValidationException("department_id is required.");
        }
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.specialization = specialization == null ? "" : specialization;
        this.phone = phone == null ? "" : phone;
        this.email = email;
        this.consultationFee = consultationFee;
        this.departmentId = departmentId;
    }

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFullName() { return firstName + " " + lastName; }
    public String getSpecialization() { return specialization; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public double getConsultationFee() { return consultationFee; }
    public Long getDepartmentId() { return departmentId; }
}
