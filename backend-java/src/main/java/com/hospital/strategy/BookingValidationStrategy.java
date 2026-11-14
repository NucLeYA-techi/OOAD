package com.hospital.strategy;

import com.hospital.model.Appointment;

/**
 * Strategy pattern (behavioral) — interchangeable booking algorithms.
 *
 * Problem (the UNIQUE(doctor_id, date, time) rule from schema.sql): the
 * "no double-booking" rule must be enforced BEFORE inserting. Hard-coding
 * it in the service freezes one hospital's policy.
 *
 * Solution: the service holds one strategy and calls isValid(); the rule can
 * be swapped (e.g. an AllowAll strategy for walk-ins) without touching it.
 */
public interface BookingValidationStrategy {

    /**
     * @param candidate the proposed appointment
     * @throws ConflictException when the booking violates the policy
     */
    void isValid(Appointment candidate);

    /** Strategy name (used in error messages). */
    String name();
}
