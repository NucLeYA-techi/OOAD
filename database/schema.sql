-- Hospital Management System — DDL + seed DML (MySQL 8.0+)
-- Source: dbms_rep (1).pdf §11 Source Code (p.17)

CREATE DATABASE IF NOT EXISTS hospital_management
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital_management;

CREATE TABLE IF NOT EXISTS department (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL UNIQUE,
  location VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS doctor (
  doctor_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (consultation_fee >= 0),
  department_id INT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES department(department_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male','Female','Other')),
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(100) UNIQUE,
  address TEXT NOT NULL,
  blood_group VARCHAR(5) CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointment (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Scheduled'
    CHECK (status IN ('Scheduled','Completed','Cancelled')),
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
  UNIQUE (doctor_id, appointment_date, appointment_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medical_record (
  record_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_id INT,
  diagnosis TEXT NOT NULL,
  prescription TEXT,
  notes TEXT,
  record_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_doctor_department ON doctor(department_id);
CREATE INDEX idx_appointment_patient ON appointment(patient_id);
CREATE INDEX idx_appointment_doctor ON appointment(doctor_id);
CREATE INDEX idx_appointment_date ON appointment(appointment_date);
CREATE INDEX idx_medical_record_patient ON medical_record(patient_id);
CREATE INDEX idx_medical_record_doctor ON medical_record(doctor_id);
CREATE INDEX idx_medical_record_appointment ON medical_record(appointment_id);

-- ============== Seed DML (sample data) ==============
INSERT IGNORE INTO department (department_name, location, phone) VALUES
  ('Cardiology','Block A, 2nd Floor','080-12345601'),
  ('Neurology','Block B, 1st Floor','080-12345602'),
  ('Orthopedics','Block A, 3rd Floor','080-12345603'),
  ('Pediatrics','Block C, Ground Floor','080-12345604');

INSERT IGNORE INTO doctor (first_name,last_name,specialization,phone,email,consultation_fee,department_id) VALUES
  ('Arjun','Rao','Cardiologist','9000000001','arjun.rao@hospital.in',800.00,1),
  ('Priya','Nair','Neurologist','9000000002','priya.nair@hospital.in',1000.00,2),
  ('Vikram','Shetty','Orthopedic Surgeon','9000000003','vikram.shetty@hospital.in',900.00,3),
  ('Divya','Kumar','Pediatrician','9000000004','divya.kumar@hospital.in',600.00,4);

INSERT IGNORE INTO patient (first_name,last_name,date_of_birth,gender,phone,email,address,blood_group) VALUES
  ('Rahul','Sharma','1990-05-12','Male','9111111111','rahul.sharma@mail.com','Bengaluru','B+'),
  ('Sneha','Patil','1985-09-03','Female','9222222222','sneha.patil@mail.com','Mysuru','O+'),
  ('Amit','Verma','1978-01-25','Male','9333333333','amit.verma@mail.com','Hubballi','A-');

INSERT IGNORE INTO appointment (patient_id,doctor_id,appointment_date,appointment_time,status,reason) VALUES
  (1,1,'2026-11-10','10:00:00','Scheduled','Chest pain and ECG checkup'),
  (2,2,'2026-11-10','11:30:00','Scheduled','Migraine follow-up'),
  (3,3,'2026-11-11','09:15:00','Scheduled','Knee pain assessment'),
  (1,1,'2026-11-05','10:00:00','Completed','Routine cardiac review');

INSERT IGNORE INTO medical_record (patient_id,doctor_id,appointment_id,diagnosis,prescription,notes) VALUES
  (1,1,4,'Hypertension (mild)','Amlodipine 5mg OD','BP 140/90; advised low-salt diet, review in 1 month');

SELECT 'Database schema created successfully!' AS message;
