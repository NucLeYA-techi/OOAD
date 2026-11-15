package com.hospital.model;

/**
 * MODEL (MVC): Person — the abstraction shared by Doctor and Patient.
 *
 * Generalization (inheritance): the two people in the system share the same
 * identity data (id, name, phone, e-mail) and the same derived behaviour
 * (full name). Putting that state and behaviour in one place removes the
 * duplicated fields and getters that used to exist in both classes.
 *
 * The class is abstract: a "Person" is never stored by itself — only its
 * concrete specializations (Doctor, Patient) are persisted.
 */
public abstract class Person {

    private final Long id;
    private final String firstName;
    private final String lastName;
    private final String phone;
    private final String email;

    protected Person(Long id, String firstName, String lastName, String phone, String email) {
        if (firstName == null || firstName.isBlank() || lastName == null || lastName.isBlank()) {
            throw new ValidationException("first_name and last_name are required.");
        }
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone == null ? "" : phone;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFullName() { return firstName + " " + lastName; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
}
