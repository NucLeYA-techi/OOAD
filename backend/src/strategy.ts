/**
 * strategy.ts — Strategy pattern (behavioral).
 *
 * Problem (the UNIQUE(doctor_id, date, time) rule from schema.sql): the
 * "no double-booking" rule must be enforced BEFORE inserting. Hard-coding
 * it in the service freezes one hospital's policy.
 *
 * Solution: BookingValidationStrategy is an interchangeable algorithm
 * family; HospitalService holds one and calls `isValid()`. The policy can
 * be swapped (e.g. AllowAllStrategy for walk-ins) without touching it.
 */
import { ConflictError } from './errors.js';
import { AppointmentRepository } from './repositories.js';
import { Appointment } from './models/index.js';

/** Base of the strategy family. Implementations must override isValid(). */
export class BookingValidationStrategy {
  async isValid(_candidate: Appointment): Promise<boolean> {
    throw new Error('BookingValidationStrategy.isValid not implemented');
  }

  name(): string {
    return 'Base';
  }
}

/**
 * The production rule — mirrors the SQL UNIQUE(doctor_id, date, time) guard.
 */
export class StrictDoubleBookingStrategy extends BookingValidationStrategy {
  private appointmentRepository: AppointmentRepository;

  constructor(appointmentRepository: AppointmentRepository) {
    super();
    this.appointmentRepository = appointmentRepository;
  }

  async isValid(candidate: Appointment): Promise<boolean> {
    const existing = await this.appointmentRepository.findAll();
    for (const a of existing) {
      if (
        a.doctor_id === candidate.doctorId() &&
        a.appointment_date === candidate.date() &&
        a.appointment_time === candidate.time() &&
        a.status === 'Scheduled'
      ) {
        throw new ConflictError(
          `Double-booking rejected: doctor ${candidate.doctorId()} already booked at ${candidate.date()} ${candidate.time()}`,
        );
      }
    }
    return true;
  }

  name(): string {
    return 'StrictDoubleBooking';
  }
}

/// Emergency/walk-in policy: conflicts allowed.
export class AllowAllStrategy extends BookingValidationStrategy {
  async isValid(_candidate: Appointment): Promise<boolean> {
    return true;
  }

  name(): string {
    return 'AllowAll';
  }
}
