package com.hospital.model;

/**
 * MODEL (MVC): Department entity — fields mirror the `department` table
 * (database/schema.sql). Encapsulation: state is private, invariants are
 * checked in the constructor (throws ValidationException).
 */
public class Department {

    private Long id;
    private String name;
    private String location;
    private String phone;

    public Department(Long id, String name, String location, String phone) {
        if (name == null || name.isBlank()) throw new ValidationException("department_name is required.");
        if (location == null || location.isBlank()) throw new ValidationException("location is required.");
        if (phone == null || phone.isBlank()) throw new ValidationException("phone is required.");
        this.id = id;
        this.name = name;
        this.location = location;
        this.phone = phone;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getLocation() { return location; }
    public String getPhone() { return phone; }
}
