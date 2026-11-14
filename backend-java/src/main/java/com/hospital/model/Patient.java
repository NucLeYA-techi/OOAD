package com.hospital.model;

import java.util.Set;

/**
 * MODEL (MVC): Patient entity — table `patient`.
 * Gender/blood-group constraints mirror the SQL CHECK constraints.
 */
public class Patient {

    private static final Set<String> GENDERS = Set.of("Male", "Female", "Other");
    private static final Set<String> BLOOD_GROUPS =
            Set.of("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-");

    private Long id;
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private String bloodGroup;

    public Patient(Long id, String firstName, String lastName, String dateOfBirth,
                   String gender, String phone, String email, String address, String bloodGroup) {
        if (firstName == null || firstName.isBlank() || lastName == null || lastName.isBlank()) {
            throw new ValidationException("first_name and last_name are required.");
        }
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
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.phone = phone == null ? "" : phone;
        this.email = email;
        this.address = address;
        this.bloodGroup = bloodGroup;
    }

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFullName() { return firstName + " " + lastName; }
    public String getDateOfBirth() { return dateOfBirth; }
    public String getGender() { return gender; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }
    public String getBloodGroup() { return bloodGroup; }
}
