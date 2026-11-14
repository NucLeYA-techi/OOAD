/**
 * services.ts — Facade + Composition + Observer Subject (structural).
 *
 * HospitalService is the Facade: routes (the HTTP Adapter layer) talk to
 * ONE object instead of coordinating five repositories, a booking Strategy
 * and the registered Observers. The service OWNS its five repositories
 * (composition) and holds the Strategy + observers by reference
 * (association). Every use case maps to one method here (Unit III
 * use-case driven design).
 */
import { DatabaseManager } from './config/database.js';
import { NotFoundError, ValidationError } from './errors.js';
import {
  Department,
  Doctor,
  Patient,
  Appointment,
  MedicalRecord,
  AppointmentStatus,
  type AppointmentStatusValue,
} from './models/index.js';
import {
  RepositoryFactory,
  type DbRow,
  DepartmentRepository,
  DoctorRepository,
  PatientRepository,
  AppointmentRepository,
  MedicalRecordRepository,
} from './repositories.js';
import { StrictDoubleBookingStrategy, type BookingValidationStrategy } from './strategy.js';
import { type AppointmentObserver } from './observer.js';
import {
  AppointmentReportGenerator,
  DepartmentSummaryReportGenerator,
} from './report.js';

export class HospitalService {
  private db: DatabaseManager;
  private departments: DepartmentRepository;
  private doctors: DoctorRepository;
  private patients: PatientRepository;
  private appointments: AppointmentRepository;
  private records: MedicalRecordRepository;
  private strategy: BookingValidationStrategy;
  private observers: AppointmentObserver[] = [];

  constructor(strategy: BookingValidationStrategy | null = null) {
    this.db = DatabaseManager.instance();
    // Composition: repositories are owned parts of the service (Factory Method).
    this.departments = RepositoryFactory.createDepartmentRepository();
    this.doctors = RepositoryFactory.createDoctorRepository();
    this.patients = RepositoryFactory.createPatientRepository();
    this.appointments = RepositoryFactory.createAppointmentRepository();
    this.records = RepositoryFactory.createMedicalRecordRepository();

    // Strategy injection: default Strict strategy bound to the appointment repo.
    this.strategy = strategy ?? new StrictDoubleBookingStrategy(this.appointments);
  }

  /** Register an observer reaction to appointment status changes. */
  attach(observer: AppointmentObserver): void {
    this.observers.push(observer);
  }

  /** Notify every attached observer (Subject -> Observers). */
  notifyStatusChanged(appointmentId: number | string, from: string, to: string): void {
    for (const observer of this.observers) {
      observer.onStatusChanged(appointmentId, from, to);
    }
  }

  // --- Departments ----------------------------------------------------------

  async listDepartments(): Promise<DbRow[]> {
    return this.departments.findAll();
  }

  async getDepartment(id: number | string): Promise<DbRow> {
    return this.departments.requireById(id, 'Department not found');
  }

  async createDepartment(body: Record<string, unknown>): Promise<DbRow | null> {
    const id = await this.departments.save(new Department(body as never));
    return this.departments.findById(id);
  }

  async updateDepartment(id: number | string, body: Record<string, unknown>): Promise<DbRow | null> {
    await this.departments.requireById(id, 'Department not found');
    await this.departments.update(
      id,
      new Department({ ...(body as object), department_id: Number(id) } as never),
    );
    return this.departments.findById(id);
  }

  async deleteDepartment(id: number | string): Promise<{ message: string }> {
    await this.departments.requireById(id, 'Department not found');
    await this.departments.deleteById(id);
    return { message: 'Department deleted successfully' };
  }

  // --- Doctors ---------------------------------------------------------------

  async listDoctors(): Promise<DbRow[]> {
    return this.doctors.findAll();
  }

  async getDoctor(id: number | string): Promise<DbRow> {
    return this.doctors.requireById(id, 'Doctor not found');
  }

  async createDoctor(body: Record<string, unknown>): Promise<DbRow | null> {
    const id = await this.doctors.save(new Doctor(body as never));
    return this.doctors.findById(id);
  }

  async updateDoctor(id: number | string, body: Record<string, unknown>): Promise<DbRow | null> {
    await this.doctors.requireById(id, 'Doctor not found');
    await this.doctors.update(id, new Doctor({ ...(body as object), doctor_id: Number(id) } as never));
    return this.doctors.findById(id);
  }

  async deleteDoctor(id: number | string): Promise<{ message: string }> {
    await this.doctors.requireById(id, 'Doctor not found');
    await this.doctors.deleteById(id);
    return { message: 'Doctor deleted successfully' };
  }

  // --- Patients ---------------------------------------------------------------

  async listPatients(): Promise<DbRow[]> {
    return this.patients.findAll();
  }

  async getPatient(id: number | string): Promise<DbRow> {
    return this.patients.requireById(id, 'Patient not found');
  }

  async createPatient(body: Record<string, unknown>): Promise<DbRow | null> {
    const id = await this.patients.save(new Patient(body as never));
    return this.patients.findById(id);
  }

  async updatePatient(id: number | string, body: Record<string, unknown>): Promise<DbRow | null> {
    await this.patients.requireById(id, 'Patient not found');
    await this.patients.update(id, new Patient({ ...(body as object), patient_id: Number(id) } as never));
    return this.patients.findById(id);
  }

  async deletePatient(id: number | string): Promise<{ message: string }> {
    await this.patients.requireById(id, 'Patient not found');
    await this.patients.deleteById(id);
    return { message: 'Patient deleted successfully (appointments & records cascaded)' };
  }

  // --- Appointments -----------------------------------------------------------

  async listAppointments(): Promise<DbRow[]> {
    return this.appointments.findAll();
  }

  async getAppointment(id: number | string): Promise<DbRow> {
    const rows = await this.db.query(
      `SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
         d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, d.specialization
       FROM appointment a
       JOIN patient p ON a.patient_id = p.patient_id
       JOIN doctor d ON a.doctor_id = d.doctor_id
       WHERE a.appointment_id = ?`,
      [id],
    );
    if (rows.rows.length === 0) throw new NotFoundError('Appointment not found');
    return rows.rows[0] as DbRow;
  }

  /**
   * Book an appointment. Main flow: validate with the injected Strategy,
   * then persist.
   */
  async createAppointment(body: Record<string, unknown>): Promise<DbRow | null> {
    const candidate = new Appointment(body as never);
    await this.strategy.isValid(candidate); // throws ConflictError on double-booking
    const id = await this.appointments.save(candidate);
    return this.appointments.findById(id);
  }

  async updateAppointment(id: number | string, body: Record<string, unknown>): Promise<DbRow | null> {
    await this.appointments.requireById(id, 'Appointment not found');
    await this.appointments.update(
      id,
      new Appointment({ ...(body as object), appointment_id: Number(id) } as never),
    );
    return this.appointments.findById(id);
  }

  /**
   * Change status. Illegal transitions throw; legal ones notify Observers.
   */
  async setAppointmentStatus(
    id: number | string,
    status: AppointmentStatusValue,
  ): Promise<DbRow | null> {
    if (!(Object.values(AppointmentStatus) as string[]).includes(status)) {
      throw new ValidationError('status must be Scheduled, Completed or Cancelled.');
    }
    const row = await this.appointments.requireById(id, 'Appointment not found');
    const appointment = new Appointment(row as never);
    const from = appointment.status();
    appointment.changeStatus(status);
    await this.appointments.updateStatus(id, status);
    this.notifyStatusChanged(id, from, status);
    return this.appointments.findById(id);
  }

  async deleteAppointment(id: number | string): Promise<{ message: string }> {
    await this.appointments.requireById(id, 'Appointment not found');
    await this.appointments.deleteById(id);
    return { message: 'Appointment deleted successfully' };
  }

  // --- Medical records ----------------------------------------------------------

  async listMedicalRecords(): Promise<DbRow[]> {
    return this.records.findAll();
  }

  async getMedicalRecord(id: number | string): Promise<DbRow> {
    return this.records.requireById(id, 'Medical record not found');
  }

  async createMedicalRecord(body: Record<string, unknown>): Promise<DbRow | null> {
    const id = await this.records.save(new MedicalRecord(body as never));
    return this.records.findById(id);
  }

  async updateMedicalRecord(id: number | string, body: Record<string, unknown>): Promise<DbRow | null> {
    await this.records.requireById(id, 'Medical record not found');
    await this.records.update(
      id,
      new MedicalRecord({ ...(body as object), record_id: Number(id) } as never),
    );
    return this.records.findById(id);
  }

  async deleteMedicalRecord(id: number | string): Promise<{ message: string }> {
    await this.records.requireById(id, 'Medical record not found');
    await this.records.deleteById(id);
    return { message: 'Medical record deleted successfully' };
  }

  // --- Reports (Template Method drivers) ----------------------------------------

  async generateAppointmentReport(): Promise<string> {
    return new AppointmentReportGenerator(await this.appointments.findAll()).generate();
  }

  async generateDepartmentSummary(): Promise<string> {
    return new DepartmentSummaryReportGenerator(
      await this.departments.findAll(),
      await this.doctors.findAll(),
    ).generate();
  }

  // --- Stats (dashboard) -----------------------------------------------------------

  async stats(): Promise<{ counts: Record<string, number>; upcoming: DbRow[] }> {
    const counts = {
      department: (await this.departments.findAll()).length,
      doctor: (await this.doctors.findAll()).length,
      patient: (await this.patients.findAll()).length,
      appointment: (await this.appointments.findAll()).length,
      medical_record: (await this.records.findAll()).length,
    };
    return { counts, upcoming: await this.appointments.findUpcoming(10) };
  }
}

// Singleton app-service shared by all route modules (routes stay thin adapters).
let _service: HospitalService | null = null;

/** The one shared service for the app. */
export function getHospitalService(): HospitalService {
  if (!_service) _service = new HospitalService();
  return _service;
}
