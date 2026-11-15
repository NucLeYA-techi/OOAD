package com.hospital.model;

import java.util.Set;

/**
 * MODEL (MVC): Patient — table `patient`.
 *
 * Generalization: Patient IS-A Person (id, names, phone, e-mail inherited).
 * It adds patient-specific state (date of birth, gender, address, blood
 * group); the gender/blood-group constraints mirror the SQL CHECK constraints.
 */
public class Patient extends Person {

    private static final Set<String> GENDERS = Set.of("Male", "Female", "Other");
    private static final Set<String> BLOOD_GROUPS =
            Set.of("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-");

    private final String dateOfBirth;
    private final String gender;
    private final String address;
    private final String bloodGroup;

    public Patient(Long id, String firstName, String lastName, String dateOfBirth,
                   String gender, String phone, String email, String address, String bloodGroup) {
        super(id, firstName, lastName, phone, email);
        if (dateOfBirth == null || dateOfBirth.isBlank()) {
            throw new ValidationException("date_of_birth is required.");
        }
        if (gender == null || !GENDERS.contains(gender)) {
            throw new ValidationException("gender must be Male, Female or Other.");
        }
        if (address == null || address.isBlank()) {
            throw new ValidationException("address is required.");
        }
        if (bloodGroup != null && !bloodGroup.isBlank() && !BLOOD_GROUPS.contains(bloodGroup)) {
            throw new ValidationException("Invalid blood_group.");
        }
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.address = address;
        this.bloodGroup = bloodGroup;
    }

    public String getDateOfBirth() { return dateOfBirth; }
    public String getGender() { return gender; }
    public String getAddress() { return address; }
    public String getBloodGroup() { return bloodGroup; }
}
