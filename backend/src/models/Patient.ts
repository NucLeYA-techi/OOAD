/**
 * Patient entity — table `patient`. Gender/blood-group constraints mirror
 * the CHECK constraints in the SQL schema.
 */
import { ValidationError } from '../errors.js';

export type Gender = 'Male' | 'Female' | 'Other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface PatientRow {
  patient_id?: number | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: Gender;
  phone?: string;
  email?: string | null;
  address: string;
  blood_group?: BloodGroup | string | null;
}

const GENDERS: readonly string[] = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS: readonly string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export class Patient {
  private _id: number | null;
  private _firstName: string;
  private _lastName: string;
  private _dob: string;
  private _gender: Gender;
  private _phone: string;
  private _email: string | null;
  private _address: string;
  private _bloodGroup: BloodGroup | string | null;

  constructor({
    patient_id = null,
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone,
    email = null,
    address,
    blood_group = null,
  }: PatientRow) {
    if (!first_name || !last_name) {
      throw new ValidationError('first_name and last_name are required.');
    }
    if (!date_of_birth) throw new ValidationError('date_of_birth is required.');
    if (!GENDERS.includes(gender)) {
      throw new ValidationError('gender must be Male, Female or Other.');
    }
    if (!address) throw new ValidationError('address is required.');
    if (blood_group && !BLOOD_GROUPS.includes(blood_group)) {
      throw new ValidationError('Invalid blood_group.');
    }
    this._id = patient_id;
    this._firstName = first_name;
    this._lastName = last_name;
    this._dob = date_of_birth;
    this._gender = gender;
    this._phone = phone ?? '';
    this._email = email;
    this._address = address;
    this._bloodGroup = blood_group;
  }

  id(): number | null {
    return this._id;
  }
  fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  /** DB-shaped representation. */
  toJSON(): PatientRow {
    return {
      patient_id: this._id,
      first_name: this._firstName,
      last_name: this._lastName,
      date_of_birth: this._dob,
      gender: this._gender,
      phone: this._phone,
      email: this._email,
      address: this._address,
      blood_group: this._bloodGroup,
    };
  }
}
