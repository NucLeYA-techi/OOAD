package com.hospital.observer;

/**
 * Observer pattern (behavioral) — reactions to appointment status changes.
 *
 * Problem: when a status changes, an audit entry and a patient notification
 * must happen. Baking that into the service couples it to logging/email.
 *
 * Solution: HospitalService is the Subject; the @Component observers below
 * are picked up by Spring as a `List<AppointmentObserver>` and notified —
 * new reactions attach without modifying the service.
 */
public interface AppointmentObserver {

    void onStatusChanged(Long appointmentId, String from, String to);
}
