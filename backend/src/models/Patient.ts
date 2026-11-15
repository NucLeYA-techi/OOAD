/**
 * Patient entity — table `patient`.
 *
 * Generalization: Patient IS-A Person (id, names, phone, e-mail inherited).
 * It adds patient-specific state (date of birth, gender, address, blood
 * group); the gender/blood-group constraints mirror the SQL CHECKs.
 */
import { ValidationError } from '../errors.js';
import { Person, type PersonRow } from './Person.js';

export type Gender = 'Male' | 'Female' | 'Other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface PatientRow extends PersonRow {
  patient_id?: number | null;
  date_of_birth: string;
  gender: Gender;
  address: string;
  blood_group?: BloodGroup | string | null;
}

const GENDERS: readonly string[] = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS: readonly string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export class Patient extends Person {
  private readonly _id: number | null;
  private readonly _dob: string;
  private readonly _gender: Gender;
  private readonly _address: string;
  private readonly _bloodGroup: BloodGroup | string | null;

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
    super({ first_name, last_name, phone, email });
    if (!date_of_birth) throw new ValidationError('date_of_birth is required.');
    if (!GENDERS.includes(gender)) {
      throw new ValidationError('gender must be Male, Female or Other.');
    }
    if (!address) throw new ValidationError('address is required.');
    if (blood_group && !BLOOD_GROUPS.includes(blood_group)) {
      throw new ValidationError('Invalid blood_group.');
    }
    this._id = patient_id;
    this._dob = date_of_birth;
    this._gender = gender;
    this._address = address;
    this._bloodGroup = blood_group;
  }

  id(): number | null {
    return this._id;
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
