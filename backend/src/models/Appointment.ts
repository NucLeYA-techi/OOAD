/**
 * Appointment entity — table `appointment`, with a real life cycle
 * (Unit II state chart):
 *        Scheduled ──> Completed
 *            │
 *            └───> Cancelled
 * Completed / Cancelled are terminal states; Scheduled -> Scheduled is illegal.
 */
import { ValidationError } from '../errors.js';

export type AppointmentStatusValue = 'Scheduled' | 'Completed' | 'Cancelled';

export interface AppointmentRow {
  appointment_id?: number | null;
  patient_id: number | string;
  doctor_id: number | string;
  appointment_date: string;
  appointment_time: string;
  status?: AppointmentStatusValue;
  reason?: string | null;
  created_at?: string | null;
}

export const AppointmentStatus = Object.freeze({
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const);

export class Appointment {
  private _id: number | null;
  private _patientId: number | string;
  private _doctorId: number | string;
  private _date: string;
  private _time: string;
  private _status: AppointmentStatusValue;
  private _reason: string | null;
  private _createdAt: string | null;

  constructor({
    appointment_id = null,
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    status = AppointmentStatus.SCHEDULED,
    reason = null,
    created_at = null,
  }: AppointmentRow) {
    if (!patient_id || !doctor_id) {
      throw new ValidationError('patient_id and doctor_id are required.');
    }
    if (!appointment_date || !appointment_time) {
      throw new ValidationError('appointment_date and appointment_time are required.');
    }
    // Normalize HH:MM -> HH:MM:00 so Strategy comparisons match MySQL TIME values.
    if (/^\d{2}:\d{2}$/.test(appointment_time)) appointment_time += ':00';
    if (!Object.values(AppointmentStatus).includes(status)) {
      throw new ValidationError('status must be Scheduled, Completed or Cancelled.');
    }
    this._id = appointment_id;
    this._patientId = patient_id;
    this._doctorId = doctor_id;
    this._date = appointment_date;
    this._time = appointment_time;
    this._status = status;
    this._reason = reason;
    this._createdAt = created_at;
  }

  id(): number | null {
    return this._id;
  }
  patientId(): number | string {
    return this._patientId;
  }
  doctorId(): number | string {
    return this._doctorId;
  }
  date(): string {
    return this._date;
  }
  time(): string {
    return this._time;
  }
  status(): AppointmentStatusValue {
    return this._status;
  }

  /** Whether transitioning to `next` is legal from the current state. */
  canTransitionTo(next: AppointmentStatusValue): boolean {
    return this._status === AppointmentStatus.SCHEDULED && next !== AppointmentStatus.SCHEDULED;
  }

  /** Apply a legal transition, or throw ValidationError. */
  changeStatus(next: AppointmentStatusValue): void {
    if (!this.canTransitionTo(next)) {
      throw new ValidationError(`Illegal transition ${this._status} -> ${next}`);
    }
    this._status = next;
  }

  /** DB-shaped representation. */
  toJSON(): AppointmentRow {
    return {
      appointment_id: this._id,
      patient_id: this._patientId,
      doctor_id: this._doctorId,
      appointment_date: this._date,
      appointment_time: this._time,
      status: this._status,
      reason: this._reason,
      created_at: this._createdAt,
    };
  }
}
