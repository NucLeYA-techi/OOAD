/**
 * Doctor entity — table `doctor`.
 *
 * Generalization: Doctor IS-A Person (id, names, phone, e-mail inherited).
 * It adds the doctor-specific state (specialization, fee, department) and
 * references its department by id (association many-to-one, role: employs).
 */
import { ValidationError } from '../errors.js';
import { Person, type PersonRow } from './Person.js';

export interface DoctorRow extends PersonRow {
  doctor_id?: number | null;
  specialization?: string;
  consultation_fee?: number | string;
  department_id: number | string;
}

export class Doctor extends Person {
  private readonly _id: number | null;
  private readonly _specialization: string;
  private readonly _fee: number;
  private readonly _departmentId: number | string;

  constructor({
    doctor_id = null,
    first_name,
    last_name,
    specialization,
    phone,
    email,
    consultation_fee = 0,
    department_id,
  }: DoctorRow) {
    super({ first_name, last_name, phone, email });
    if (!email || !email.includes('@')) {
      throw new ValidationError('A valid email is required.');
    }
    if (Number(consultation_fee) < 0) {
      throw new ValidationError('consultation_fee cannot be negative.');
    }
    if (department_id == null) throw new ValidationError('department_id is required.');
    this._id = doctor_id;
    this._specialization = specialization ?? '';
    this._fee = Number(consultation_fee) || 0;
    this._departmentId = department_id;
  }

  id(): number | null {
    return this._id;
  }

  departmentId(): number | string {
    return this._departmentId;
  }

  /** DB-shaped representation. */
  toJSON(): DoctorRow {
    return {
      doctor_id: this._id,
      first_name: this._firstName,
      last_name: this._lastName,
      specialization: this._specialization,
      phone: this._phone,
      email: this._email,
      consultation_fee: this._fee,
      department_id: this._departmentId,
    };
  }
}
