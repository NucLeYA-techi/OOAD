/**
 * observer.ts — Observer pattern (behavioral).
 *
 * Problem: when an appointment status changes, several things must happen
 * (audit entry, patient notification). Baking that into the service couples
 * it to logging/email.
 *
 * Solution: HospitalService is the Subject; AuditLogger and
 * NotificationService are Observers. The service only calls notify() —
 * new reactions attach without modifying the service.
 */

/** Base observer. */
export class AppointmentObserver {
  onStatusChanged(
    _appointmentId: number | string,
    _from: string,
    _to: string,
  ): void {
    throw new Error('AppointmentObserver.onStatusChanged not implemented');
  }
}

/** Records every status change in an in-memory log (+ console). */
export class AuditLogger extends AppointmentObserver {
  log: string[] = [];

  onStatusChanged(appointmentId: number | string, from: string, to: string): void {
    const entry = `Appointment #${appointmentId}: ${from} -> ${to}`;
    this.log.push(entry);
    console.log(`  [Audit] ${entry}`);
  }
}

/** Simulates patient notifications (records them + logs to console). */
export class NotificationService extends AppointmentObserver {
  sent: string[] = [];

  onStatusChanged(appointmentId: number | string, _from: string, to: string): void {
    const msg = `Notify patient: appointment #${appointmentId} is now ${to}`;
    this.sent.push(msg);
    console.log(`  [Notify] ${msg}`);
  }
}
