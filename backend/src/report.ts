/**
 * report.ts — Template Method pattern (behavioral).
 *
 * Problem: every report shares the skeleton (header -> body -> footer) but
 * renders different content; copy-pasting the skeleton into subclasses
 * duplicates logic (a Unit IV design pitfall).
 *
 * Solution: ReportGenerator fixes the skeleton in generate(); subclasses
 * supply only the variable steps.
 */
import { DbRow } from './repositories.js';

/** Base generator. `generate()` is the template method — do not override. */
export class ReportGenerator {
  generate(): string {
    return this.header() + this.body() + this.footer();
  }

  header(): string {
    return '=== Hospital Report ===\n';
  }

  body(): string {
    throw new Error('ReportGenerator.body not implemented');
  }

  footer(): string {
    return '=== End of report ===\n';
  }
}

/** Lists all appointments with their status. */
export class AppointmentReportGenerator extends ReportGenerator {
  private appointments: DbRow[];

  constructor(appointments: DbRow[]) {
    super();
    this.appointments = appointments;
  }

  header(): string {
    return '--- Appointment Report ---\n';
  }

  body(): string {
    let out = '';
    for (const a of this.appointments) {
      out += `Appt #${a.appointment_id} doctor=${a.doctor_id} patient=${a.patient_id} on ${a.appointment_date} ${a.appointment_time} [${a.status}]\n`;
    }
    return out;
  }
}

/** Lists departments and how many doctors each has (aggregation in action). */
export class DepartmentSummaryReportGenerator extends ReportGenerator {
  private departments: DbRow[];
  private doctors: DbRow[];

  constructor(departments: DbRow[], doctors: DbRow[]) {
    super();
    this.departments = departments;
    this.doctors = doctors;
  }

  header(): string {
    return '--- Department Summary ---\n';
  }

  body(): string {
    let out = '';
    for (const d of this.departments) {
      const count = this.doctors.filter((doc) => doc.department_id === d.department_id).length;
      out += `${d.department_name} (${d.location}): ${count} doctor(s)\n`;
    }
    return out;
  }
}
