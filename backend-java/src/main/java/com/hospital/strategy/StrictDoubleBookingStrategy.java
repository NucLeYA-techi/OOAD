package com.hospital.strategy;

import com.hospital.model.Appointment;
import com.hospital.model.ConflictException;
import com.hospital.repository.AppointmentRepository;
import org.springframework.stereotype.Component;

/**
 * The production rule — mirrors the SQL UNIQUE(doctor_id, date, time) guard.
 * A Spring @Component: the container injects it into HospitalService.
 */
@Component
public class StrictDoubleBookingStrategy implements BookingValidationStrategy {

    private final AppointmentRepository appointments;

    public StrictDoubleBookingStrategy(AppointmentRepository appointments) {
        this.appointments = appointments;
    }

    @Override
    public void isValid(Appointment candidate) {
        for (Appointment existing : appointments.findAll()) {
            if (existing.getDoctorId().equals(candidate.getDoctorId())
                    && existing.getDate().equals(candidate.getDate())
                    && existing.getTime().equals(candidate.getTime())
                    && existing.getStatus() == Appointment.Status.Scheduled) {
                throw new ConflictException("Double-booking rejected: doctor " + candidate.getDoctorId()
                        + " already booked at " + candidate.getDate() + " " + candidate.getTime());
            }
        }
    }

    @Override
    public String name() {
        return "StrictDoubleBooking";
    }
}
