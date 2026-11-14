/**
 * Department entity — fields mirror the `department` table (schema.sql).
 * Encapsulation: state is private, invariants are checked in the constructor.
 */
import { ValidationError } from '../errors.js';

export interface DepartmentRow {
  department_id?: number | null;
  department_name: string;
  location: string;
  phone: string;
}

export class Department {
  private _id: number | null;
  private _name: string;
  private _location: string;
  private _phone: string;

  constructor({ department_id = null, department_name, location, phone }: DepartmentRow) {
    if (!department_name) throw new ValidationError('department_name is required.');
    if (!location) throw new ValidationError('location is required.');
    if (!phone) throw new ValidationError('phone is required.');
    this._id = department_id;
    this._name = department_name;
    this._location = location;
    this._phone = phone;
  }

  id(): number | null {
    return this._id;
  }
  name(): string {
    return this._name;
  }
  location(): string {
    return this._location;
  }
  phone(): string {
    return this._phone;
  }

  /** DB-shaped representation. */
  toJSON(): DepartmentRow {
    return {
      department_id: this._id,
      department_name: this._name,
      location: this._location,
      phone: this._phone,
    };
  }
}
