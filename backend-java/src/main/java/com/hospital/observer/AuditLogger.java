package com.hospital.observer;

import org.springframework.stereotype.Component;

/** Observer 1: keeps an audit trail of every status change. */
@Component
public class AuditLogger implements AppointmentObserver {

    @Override
    public void onStatusChanged(Long appointmentId, String from, String to) {
        System.out.println("  [Audit] Appointment #" + appointmentId + ": " + from + " -> " + to);
    }
}
