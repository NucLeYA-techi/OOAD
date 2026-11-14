/**
 * MedicalRecord entity — table `medical_record`. References Patient, Doctor
 * and (optionally) Appointment by id.
 */
import { ValidationError } from '../errors.js';

export interface MedicalRecordRow {
  record_id?: number | null;
  patient_id: number | string;
  doctor_id: number | string;
  appointment_id?: number | string | null;
  diagnosis: string;
  prescription?: string | null;
  notes?: string | null;
  record_date?: string | null;
}

export class MedicalRecord {
  private _id: number | null;
  private _patientId: number | string;
  private _doctorId: number | string;
  private _appointmentId: number | string | null;
  private _diagnosis: string;
  private _prescription: string | null;
  private _notes: string | null;
  private _recordDate: string | null;

  constructor({
    record_id = null,
    patient_id,
    doctor_id,
    appointment_id = null,
    diagnosis,
    prescription = null,
    notes = null,
    record_date = null,
  }: MedicalRecordRow) {
    if (!patient_id || !doctor_id) {
      throw new ValidationError('patient_id and doctor_id are required.');
    }
    if (!diagnosis) throw new ValidationError('diagnosis is required.');
    this._id = record_id;
    this._patientId = patient_id;
    this._doctorId = doctor_id;
    this._appointmentId = appointment_id;
    this._diagnosis = diagnosis;
    this._prescription = prescription;
    this._notes = notes;
    this._recordDate = record_date;
  }

  id(): number | null {
    return this._id;
  }

  /** DB-shaped representation. */
  toJSON(): MedicalRecordRow {
    return {
      record_id: this._id,
      patient_id: this._patientId,
      doctor_id: this._doctorId,
      appointment_id: this._appointmentId,
      diagnosis: this._diagnosis,
      prescription: this._prescription,
      notes: this._notes,
      record_date: this._recordDate,
    };
  }
}
