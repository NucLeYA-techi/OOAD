/**
 * Person — the abstraction shared by Doctor and Patient (generalization).
 *
 * Both people in the system share the same identity data and the same
 * derived behaviour (full name), so that state lives once, here, instead of
 * being duplicated in the two subclasses.
 *
 * The class is abstract: a bare "person" is never stored — only Doctor and
 * Patient are persisted, each with its own table.
 */
import { ValidationError } from '../errors.js';

/** Fields every person carries. */
export interface PersonRow {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string | null;
}

export abstract class Person {
  protected readonly _firstName: string;
  protected readonly _lastName: string;
  protected readonly _phone: string;
  protected readonly _email: string | null;

  protected constructor({ first_name, last_name, phone, email = null }: PersonRow) {
    if (!first_name || !last_name) {
      throw new ValidationError('first_name and last_name are required.');
    }
    this._firstName = first_name;
    this._lastName = last_name;
    this._phone = phone ?? '';
    this._email = email;
  }

  fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  /** DB-shaped representation, implemented by each specialization. */
  abstract toJSON(): object;
}
