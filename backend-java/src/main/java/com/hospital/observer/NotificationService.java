package com.hospital.observer;

import org.springframework.stereotype.Component;

/** Observer 2: simulates notifying the patient about a status change. */
@Component
public class NotificationService implements AppointmentObserver {

    @Override
    public void onStatusChanged(Long appointmentId, String from, String to) {
        System.out.println("  [Notify] Notify patient: appointment #" + appointmentId + " is now " + to);
    }
}
