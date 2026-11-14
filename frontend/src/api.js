// Thin fetch wrapper around the Express REST API.
const BASE = '/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  stats: () => req('/stats'),
  departments: () => req('/departments'),
  createDepartment: (body) => req('/departments', { method: 'POST', body: JSON.stringify(body) }),
  deleteDepartment: (id) => req(`/departments/${id}`, { method: 'DELETE' }),
  doctors: () => req('/doctors'),
  createDoctor: (body) => req('/doctors', { method: 'POST', body: JSON.stringify(body) }),
  deleteDoctor: (id) => req(`/doctors/${id}`, { method: 'DELETE' }),
  patients: () => req('/patients'),
  createPatient: (body) => req('/patients', { method: 'POST', body: JSON.stringify(body) }),
  deletePatient: (id) => req(`/patients/${id}`, { method: 'DELETE' }),
  appointments: () => req('/appointments'),
  createAppointment: (body) => req('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  setAppointmentStatus: (id, status) => req(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteAppointment: (id) => req(`/appointments/${id}`, { method: 'DELETE' }),
  medicalRecords: () => req('/medical-records'),
  createMedicalRecord: (body) => req('/medical-records', { method: 'POST', body: JSON.stringify(body) }),
  deleteMedicalRecord: (id) => req(`/medical-records/${id}`, { method: 'DELETE' }),
};
