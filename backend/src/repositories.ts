/**
 * repositories.ts — Data-access layer (one repository per table, CRUD via
 * parameterized SQL only — the same tables/queries as the original routers).
 *
 * Design patterns:
 *   * Template Method  — BaseRepository.save()/update() fix the skeleton
 *                        "validate -> persist -> afterSave hook"; subclasses
 *                        only fill in the steps.
 *   * Factory Method   — RepositoryFactory is the single creation point for
 *                        the five repositories (each bound to the shared
 *                        DatabaseManager singleton).
 *
 * SECURITY: table/pk identifiers below are internal constants (never user
 * input); every VALUE is passed through `?` placeholders (no interpolation).
 */
import { DatabaseManager } from './config/database.js';
import { NotFoundError, ValidationError } from './errors.js';

/** A row as it arrives from MySQL (driver gives loosely-typed objects). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbRow = Record<string, any>;

/** Anything a repository can store: a domain entity with toJSON(). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Entity {
  toJSON(): any; // DB rows are loosely typed by the driver; repos narrow them.
}

/**
 * Base of every repository. `save()` / `update()` are the template methods;
 * subclasses override the hooks, never the skeleton.
 */
export class BaseRepository<T extends Entity> {
  protected db: DatabaseManager;
  protected table: string;
  protected pk: string;

  constructor() {
    // Shared singleton handle (association, not owned).
    this.db = DatabaseManager.instance();
    this.table = 'unset';
    this.pk = 'id';
  }

  /** Template method: create a row (validate -> persist -> afterSave hook). */
  async save(entity: T): Promise<number> {
    this.validateEntity(entity);
    const id = await this.persist(entity);
    this.afterSave(entity, id);
    return id;
  }

  /** Template method: update a row (validate -> persist update). */
  async update(id: number | string, entity: T): Promise<number> {
    this.validateEntity(entity);
    return this.persistUpdate(id, entity);
  }

  /** Hook: entity-level checks before any SQL runs. */
  validateEntity(_entity: T): void {}

  /** Hook: INSERT the row. */
  persist(_entity: T): Promise<number> {
    throw new Error(`${this.constructor.name}.persist not implemented`);
  }

  /** Hook: UPDATE the row. */
  persistUpdate(_id: number | string, _entity: T): Promise<number> {
    throw new Error(`${this.constructor.name}.persistUpdate not implemented`);
  }

  /** Hook: post-insert bookkeeping (default: no-op). */
  afterSave(_entity: T, _id: number): void {}

  /** All rows (subclasses add JOINs/ORDER BY). */
  async findAll(): Promise<DbRow[]> {
    throw new Error(`${this.constructor.name}.findAll not implemented`);
  }

  async findById(id: number | string): Promise<DbRow | null> {
    const result = await this.db.query(`SELECT * FROM ${this.table} WHERE ${this.pk} = ?`, [id]);
    return (result.rows[0] as DbRow | undefined) ?? null;
  }

  async requireById(id: number | string, message: string): Promise<DbRow> {
    const row = await this.findById(id);
    if (!row) throw new NotFoundError(message);
    return row;
  }

  async deleteById(id: number | string): Promise<void> {
    await this.db.query(`DELETE FROM ${this.table} WHERE ${this.pk} = ?`, [id]);
  }
}

export class DepartmentRepository extends BaseRepository<Entity> {
  constructor() {
    super();
    this.table = 'department';
    this.pk = 'department_id';
  }

  async findAll(): Promise<DbRow[]> {
    const result = await this.db.query('SELECT * FROM department ORDER BY department_id');
    return result.rows as DbRow[];
  }

  async persist(entity: Entity): Promise<number> {
    const d = entity.toJSON();
    const result = await this.db.query(
      'INSERT INTO department (department_name, location, phone) VALUES (?, ?, ?)',
      [d.department_name as string, d.location as string, d.phone as string],
    );
    return result.insertId;
  }

  async persistUpdate(id: number | string, entity: Entity): Promise<number> {
    const d = entity.toJSON();
    await this.db.query(
      'UPDATE department SET department_name = ?, location = ?, phone = ? WHERE department_id = ?',
      [d.department_name as string, d.location as string, d.phone as string, id],
    );
    return Number(id);
  }
}

export class DoctorRepository extends BaseRepository<Entity> {
  constructor() {
    super();
    this.table = 'doctor';
    this.pk = 'doctor_id';
  }

  async findAll(): Promise<DbRow[]> {
    const result = await this.db.query(
      `SELECT d.*, dep.department_name FROM doctor d
       JOIN department dep ON d.department_id = dep.department_id
       ORDER BY d.doctor_id`,
    );
    return result.rows as DbRow[];
  }

  validateEntity(entity: Entity): void {
    // Cheap local check first; the SQL FK remains the backstop.
    if ((entity.toJSON().department_id as number | string | undefined) == null) {
      throw new ValidationError('department_id is required.');
    }
  }

  async persist(entity: Entity): Promise<number> {
    const d = entity.toJSON();
    const result = await this.db.query(
      `INSERT INTO doctor (first_name, last_name, specialization, phone, email,
         consultation_fee, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        d.first_name as string,
        d.last_name as string,
        d.specialization as string,
        d.phone as string,
        d.email as string,
        d.consultation_fee as number,
        d.department_id as number | string,
      ],
    );
    return result.insertId;
  }

  async persistUpdate(id: number | string, entity: Entity): Promise<number> {
    const d = entity.toJSON();
    await this.db.query(
      `UPDATE doctor SET first_name = ?, last_name = ?, specialization = ?, phone = ?,
         email = ?, consultation_fee = ?, department_id = ? WHERE doctor_id = ?`,
      [
        d.first_name as string,
        d.last_name as string,
        d.specialization as string,
        d.phone as string,
        d.email as string,
        d.consultation_fee as number,
        d.department_id as number | string,
        id,
      ],
    );
    return Number(id);
  }
}

export class PatientRepository extends BaseRepository<Entity> {
  constructor() {
    super();
    this.table = 'patient';
    this.pk = 'patient_id';
  }

  async findAll(): Promise<DbRow[]> {
    const result = await this.db.query('SELECT * FROM patient ORDER BY patient_id');
    return result.rows as DbRow[];
  }

  async persist(entity: Entity): Promise<number> {
    const p = entity.toJSON();
    const result = await this.db.query(
      `INSERT INTO patient (first_name, last_name, date_of_birth, gender, phone,
         email, address, blood_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.first_name as string,
        p.last_name as string,
        p.date_of_birth as string,
        p.gender as string,
        p.phone as string,
        (p.email as string | null) || null,
        p.address as string,
        (p.blood_group as string | null) || null,
      ],
    );
    return result.insertId;
  }

  async persistUpdate(id: number | string, entity: Entity): Promise<number> {
    const p = entity.toJSON();
    await this.db.query(
      `UPDATE patient SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?,
         phone = ?, email = ?, address = ?, blood_group = ? WHERE patient_id = ?`,
      [
        p.first_name as string,
        p.last_name as string,
        p.date_of_birth as string,
        p.gender as string,
        p.phone as string,
        (p.email as string | null) || null,
        p.address as string,
        (p.blood_group as string | null) || null,
        id,
      ],
    );
    return Number(id);
  }
}

export class AppointmentRepository extends BaseRepository<Entity> {
  constructor() {
    super();
    this.table = 'appointment';
    this.pk = 'appointment_id';
  }

  /** Joined list — same shape the original GET /appointments returned. */
  async findAll(): Promise<DbRow[]> {
    const result = await this.db.query(
      `SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
         d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, d.specialization
       FROM appointment a
       JOIN patient p ON a.patient_id = p.patient_id
       JOIN doctor d ON a.doctor_id = d.doctor_id
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
    );
    return result.rows as DbRow[];
  }

  async persist(entity: Entity): Promise<number> {
    const a = entity.toJSON();
    const result = await this.db.query(
      `INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time,
         status, reason) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        a.patient_id as number | string,
        a.doctor_id as number | string,
        a.appointment_date as string,
        a.appointment_time as string,
        (a.status as string) || 'Scheduled',
        (a.reason as string | null) || null,
      ],
    );
    return result.insertId;
  }

  async persistUpdate(id: number | string, entity: Entity): Promise<number> {
    const a = entity.toJSON();
    await this.db.query(
      `UPDATE appointment SET patient_id = ?, doctor_id = ?, appointment_date = ?,
         appointment_time = ?, status = ?, reason = ? WHERE appointment_id = ?`,
      [
        a.patient_id as number | string,
        a.doctor_id as number | string,
        a.appointment_date as string,
        a.appointment_time as string,
        a.status as string,
        a.reason as string | null,
        id,
      ],
    );
    return Number(id);
  }

  async updateStatus(id: number | string, status: string): Promise<number> {
    await this.db.query('UPDATE appointment SET status = ? WHERE appointment_id = ?', [status, id]);
    return Number(id);
  }

  async findUpcoming(limit: number = 10): Promise<DbRow[]> {
    const result = await this.db.query(
      `SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status,
         p.first_name AS patient, d.first_name AS doctor, d.specialization
       FROM appointment a JOIN patient p ON a.patient_id = p.patient_id
       JOIN doctor d ON a.doctor_id = d.doctor_id
       WHERE a.status = 'Scheduled' ORDER BY a.appointment_date, a.appointment_time LIMIT ?`,
      [limit],
    );
    return result.rows as DbRow[];
  }
}

export class MedicalRecordRepository extends BaseRepository<Entity> {
  constructor() {
    super();
    this.table = 'medical_record';
    this.pk = 'record_id';
  }

  async findAll(): Promise<DbRow[]> {
    const result = await this.db.query(
      `SELECT m.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
         d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
       FROM medical_record m
       JOIN patient p ON m.patient_id = p.patient_id
       JOIN doctor d ON m.doctor_id = d.doctor_id
       ORDER BY m.record_date DESC`,
    );
    return result.rows as DbRow[];
  }

  async persist(entity: Entity): Promise<number> {
    const m = entity.toJSON();
    const result = await this.db.query(
      `INSERT INTO medical_record (patient_id, doctor_id, appointment_id, diagnosis,
         prescription, notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        m.patient_id as number | string,
        m.doctor_id as number | string,
        (m.appointment_id as number | string | null) || null,
        m.diagnosis as string,
        (m.prescription as string | null) || null,
        (m.notes as string | null) || null,
      ],
    );
    return result.insertId;
  }

  async persistUpdate(id: number | string, entity: Entity): Promise<number> {
    const m = entity.toJSON();
    await this.db.query(
      `UPDATE medical_record SET patient_id = ?, doctor_id = ?, appointment_id = ?,
         diagnosis = ?, prescription = ?, notes = ? WHERE record_id = ?`,
      [
        m.patient_id as number | string,
        m.doctor_id as number | string,
        (m.appointment_id as number | string | null) || null,
        m.diagnosis as string,
        (m.prescription as string | null) || null,
        (m.notes as string | null) || null,
        id,
      ],
    );
    return Number(id);
  }
}

/** Factory Method: single creation point for the repositories. */
export class RepositoryFactory {
  static createDepartmentRepository(): DepartmentRepository {
    return new DepartmentRepository();
  }
  static createDoctorRepository(): DoctorRepository {
    return new DoctorRepository();
  }
  static createPatientRepository(): PatientRepository {
    return new PatientRepository();
  }
  static createAppointmentRepository(): AppointmentRepository {
    return new AppointmentRepository();
  }
  static createMedicalRecordRepository(): MedicalRecordRepository {
    return new MedicalRecordRepository();
  }
}
