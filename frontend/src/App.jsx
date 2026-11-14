import { useEffect, useState } from 'react';
import { api } from './api.js';

const TABS = ['Dashboard', 'Departments', 'Doctors', 'Patients', 'Appointments', 'Medical Records'];

function useLoader(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = async () => {
    try { setError(''); setData(await fn()); }
    catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, deps);
  return { data, error, load };
}

export default function App() {
  const [tab, setTab] = useState('Dashboard');

  return (
    <>
      <header><h1>🏥 Hospital Management System</h1></header>
      <nav>
        {TABS.map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </nav>
      <main>
        {tab === 'Dashboard' && <Dashboard />}
        {tab === 'Departments' && <Departments />}
        {tab === 'Doctors' && <Doctors />}
        {tab === 'Patients' && <Patients />}
        {tab === 'Appointments' && <Appointments />}
        {tab === 'Medical Records' && <MedicalRecords />}
      </main>
    </>
  );
}

function Dashboard() {
  const { data, error } = useLoader(api.stats);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading…</p>;
  return (
    <>
      <div className="stats">
        {Object.entries(data.counts).map(([k, v]) => (
          <div key={k} className="card stat"><b>{v}</b>{k}</div>
        ))}
      </div>
      <div className="card">
        <h3>Upcoming appointments</h3>
        <table>
          <thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Doctor</th><th>Specialization</th><th>Status</th></tr></thead>
          <tbody>
            {data.upcoming.map((a) => (
              <tr key={a.appointment_id}><td>{a.appointment_date}</td><td>{a.appointment_time}</td>
                <td>{a.patient}</td><td>{a.doctor}</td><td>{a.specialization}</td><td>{a.status}</td></tr>
            ))}
            {data.upcoming.length === 0 && <tr><td colSpan={6} className="muted">No upcoming appointments.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Departments() {
  const { data, error, load } = useLoader(api.departments);
  const [f, setF] = useState({ department_name: '', location: '', phone: '' });
  const submit = async (e) => {
    e.preventDefault();
    try { await api.createDepartment(f); setF({ department_name: '', location: '', phone: '' }); load(); }
    catch (err) { alert(err.message); }
  };
  return (
    <div className="card">
      <h3>Departments</h3>
      <form onSubmit={submit}>
        <input placeholder="Name" value={f.department_name} onChange={(e) => setF({ ...f, department_name: e.target.value })} required />
        <input placeholder="Location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} required />
        <input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} required />
        <button className="primary">Add</button>
      </form>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Phone</th><th></th></tr></thead>
        <tbody>{data?.map((d) => (
          <tr key={d.department_id}><td>{d.department_id}</td><td>{d.department_name}</td><td>{d.location}</td><td>{d.phone}</td>
            <td><button className="danger" onClick={async () => { try { await api.deleteDepartment(d.department_id); load(); } catch (err) { alert(err.message); } }}>Delete</button></td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Doctors() {
  const { data, error, load } = useLoader(api.doctors);
  const { data: deps } = useLoader(api.departments);
  const [f, setF] = useState({ first_name: '', last_name: '', specialization: '', phone: '', email: '', consultation_fee: 0, department_id: '' });
  const submit = async (e) => {
    e.preventDefault();
    try { await api.createDoctor({ ...f, department_id: Number(f.department_id) }); load(); }
    catch (err) { alert(err.message); }
  };
  return (
    <div className="card">
      <h3>Doctors</h3>
      <form onSubmit={submit}>
        <input placeholder="First name" value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} required />
        <input placeholder="Last name" value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} required />
        <input placeholder="Specialization" value={f.specialization} onChange={(e) => setF({ ...f, specialization: e.target.value })} required />
        <input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} required />
        <input placeholder="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
        <input placeholder="Fee" type="number" min="0" value={f.consultation_fee} onChange={(e) => setF({ ...f, consultation_fee: e.target.value })} />
        <select value={f.department_id} onChange={(e) => setF({ ...f, department_id: e.target.value })} required>
          <option value="">Select department</option>
          {deps?.map((d) => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
        </select>
        <button className="primary">Add</button>
      </form>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Name</th><th>Specialization</th><th>Department</th><th>Fee</th><th>Email</th><th></th></tr></thead>
        <tbody>{data?.map((d) => (
          <tr key={d.doctor_id}><td>{d.first_name} {d.last_name}</td><td>{d.specialization}</td><td>{d.department_name}</td>
            <td>₹{d.consultation_fee}</td><td>{d.email}</td>
            <td><button className="danger" onClick={async () => { try { await api.deleteDoctor(d.doctor_id); load(); } catch (err) { alert(err.message); } }}>Delete</button></td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Patients() {
  const { data, error, load } = useLoader(api.patients);
  const [f, setF] = useState({ first_name: '', last_name: '', date_of_birth: '', gender: 'Male', phone: '', email: '', address: '', blood_group: 'O+' });
  const submit = async (e) => {
    e.preventDefault();
    try { await api.createPatient(f); load(); }
    catch (err) { alert(err.message); }
  };
  return (
    <div className="card">
      <h3>Patients</h3>
      <form onSubmit={submit}>
        <input placeholder="First name" value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} required />
        <input placeholder="Last name" value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} required />
        <input type="date" value={f.date_of_birth} onChange={(e) => setF({ ...f, date_of_birth: e.target.value })} required />
        <select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}><option>Male</option><option>Female</option><option>Other</option></select>
        <input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} required />
        <input placeholder="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input placeholder="Address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} required />
        <select value={f.blood_group} onChange={(e) => setF({ ...f, blood_group: e.target.value })}>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => <option key={b}>{b}</option>)}
        </select>
        <button className="primary">Add</button>
      </form>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Name</th><th>DOB</th><th>Gender</th><th>Blood</th><th>Phone</th><th></th></tr></thead>
        <tbody>{data?.map((p) => (
          <tr key={p.patient_id}><td>{p.first_name} {p.last_name}</td><td>{p.date_of_birth}</td><td>{p.gender}</td>
            <td>{p.blood_group}</td><td>{p.phone}</td>
            <td><button className="danger" onClick={async () => { try { await api.deletePatient(p.patient_id); load(); } catch (err) { alert(err.message); } }}>Delete</button></td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Appointments() {
  const { data, error, load } = useLoader(api.appointments);
  const { data: patients } = useLoader(api.patients);
  const { data: doctors } = useLoader(api.doctors);
  const [f, setF] = useState({ patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', reason: '' });
  const submit = async (e) => {
    e.preventDefault();
    try { await api.createAppointment({ ...f, patient_id: Number(f.patient_id), doctor_id: Number(f.doctor_id) }); load(); }
    catch (err) { alert(err.message); }
  };
  return (
    <div className="card">
      <h3>Appointments <span className="muted">(double-booking a doctor at the same date/time is rejected with 409)</span></h3>
      <form onSubmit={submit}>
        <select value={f.patient_id} onChange={(e) => setF({ ...f, patient_id: e.target.value })} required>
          <option value="">Select patient</option>{patients?.map((p) => <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name}</option>)}
        </select>
        <select value={f.doctor_id} onChange={(e) => setF({ ...f, doctor_id: e.target.value })} required>
          <option value="">Select doctor</option>{doctors?.map((d) => <option key={d.doctor_id} value={d.doctor_id}>{d.first_name} {d.last_name}</option>)}
        </select>
        <input type="date" value={f.appointment_date} onChange={(e) => setF({ ...f, appointment_date: e.target.value })} required />
        <input type="time" value={f.appointment_time} onChange={(e) => setF({ ...f, appointment_time: e.target.value })} required />
        <input placeholder="Reason" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} />
        <button className="primary">Book</button>
      </form>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Reason</th><th>Actions</th></tr></thead>
        <tbody>{data?.map((a) => (
          <tr key={a.appointment_id}><td>{a.appointment_date}</td><td>{a.appointment_time}</td>
            <td>{a.patient_first_name} {a.patient_last_name}</td><td>{a.doctor_first_name} {a.doctor_last_name}</td>
            <td>{a.status}</td><td>{a.reason}</td>
            <td>
              <select value={a.status} onChange={async (e) => { try { await api.setAppointmentStatus(a.appointment_id, e.target.value); load(); } catch (err) { alert(err.message); } }}>
                <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
              </select>{' '}
              <button className="danger" onClick={async () => { try { await api.deleteAppointment(a.appointment_id); load(); } catch (err) { alert(err.message); } }}>Delete</button>
            </td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function MedicalRecords() {
  const { data, error, load } = useLoader(api.medicalRecords);
  const { data: patients } = useLoader(api.patients);
  const { data: doctors } = useLoader(api.doctors);
  const [f, setF] = useState({ patient_id: '', doctor_id: '', diagnosis: '', prescription: '', notes: '' });
  const submit = async (e) => {
    e.preventDefault();
    try { await api.createMedicalRecord({ ...f, patient_id: Number(f.patient_id), doctor_id: Number(f.doctor_id) }); load(); }
    catch (err) { alert(err.message); }
  };
  return (
    <div className="card">
      <h3>Medical Records</h3>
      <form onSubmit={submit}>
        <select value={f.patient_id} onChange={(e) => setF({ ...f, patient_id: e.target.value })} required>
          <option value="">Select patient</option>{patients?.map((p) => <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name}</option>)}
        </select>
        <select value={f.doctor_id} onChange={(e) => setF({ ...f, doctor_id: e.target.value })} required>
          <option value="">Select doctor</option>{doctors?.map((d) => <option key={d.doctor_id} value={d.doctor_id}>{d.first_name} {d.last_name}</option>)}
        </select>
        <input placeholder="Diagnosis" value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} required />
        <input placeholder="Prescription" value={f.prescription} onChange={(e) => setF({ ...f, prescription: e.target.value })} />
        <input placeholder="Notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <button className="primary">Add</button>
      </form>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Prescription</th><th>Date</th><th></th></tr></thead>
        <tbody>{data?.map((m) => (
          <tr key={m.record_id}><td>{m.patient_first_name} {m.patient_last_name}</td><td>{m.doctor_first_name} {m.doctor_last_name}</td>
            <td>{m.diagnosis}</td><td>{m.prescription}</td><td>{m.record_date}</td>
            <td><button className="danger" onClick={async () => { try { await api.deleteMedicalRecord(m.record_id); load(); } catch (err) { alert(err.message); } }}>Delete</button></td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}
