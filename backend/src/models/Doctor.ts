/**
 * Doctor entity — table `doctor`. Validates fee/email; references its
 * department by id (association many-to-one, role: employs).
 */
import { ValidationError } from '../errors.js';

export interface DoctorRow {
  doctor_id?: number | null;
  first_name: string;
  last_name: string;
  specialization?: string;
  phone?: string;
  email: string;
  consultation_fee?: number | string;
  department_id: number | string;
}

export class Doctor {
  private _id: number | null;
  private _firstName: string;
  private _lastName: string;
  private _specialization: string;
  private _phone: string;
  private _email: string;
  private _fee: number;
  private _departmentId: number | string;

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
    if (!first_name || !last_name) {
      throw new ValidationError('first_name and last_name are required.');
    }
    if (!email || !email.includes('@')) {
      throw new ValidationError('A valid email is required.');
    }
    if (Number(consultation_fee) < 0) {
      throw new ValidationError('consultation_fee cannot be negative.');
    }
    if (department_id == null) throw new ValidationError('department_id is required.');
    this._id = doctor_id;
    this._firstName = first_name;
    this._lastName = last_name;
    this._specialization = specialization ?? '';
    this._phone = phone ?? '';
    this._email = email;
    this._fee = Number(consultation_fee) || 0;
    this._departmentId = department_id;
  }

  id(): number | null {
    return this._id;
  }
  fullName(): string {
    return `${this._firstName} ${this._lastName}`;
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
