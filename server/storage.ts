// import {
//   doctors,
//   patients,
//   appointments,
//   notificationSettings,
//   type Doctor,
//   type Patient,
//   type Appointment,
//   type NotificationSettings,
//   type InsertDoctor,
//   type InsertPatient,
//   type InsertAppointment,
//   type InsertNotificationSettings,
//   type AppointmentWithDetails
// } from "@shared/schema";
// import { db } from "./project_root/db";
// export interface IStorage {
//   // Doctors
//   getDoctors(): Promise<Doctor[]>;
//   getDoctor(id: number): Promise<Doctor | undefined>;
//   createDoctor(doctor: InsertDoctor): Promise<Doctor>;

//   // Patients
//   getPatients(): Promise<Patient[]>;
//   getPatient(id: number): Promise<Patient | undefined>;
//   getPatientByEmail(email: string): Promise<Patient | undefined>;
//   createPatient(patient: InsertPatient): Promise<Patient>;

//   // Appointments
//   getAppointments(): Promise<Appointment[]>;
//   getAppointmentsWithDetails(): Promise<AppointmentWithDetails[]>;
//   getAppointmentsByDoctor(doctorId: number, date?: string): Promise<AppointmentWithDetails[]>;
//   getAppointmentsByPatient(patientId: number): Promise<AppointmentWithDetails[]>;
//   getAppointment(id: number): Promise<Appointment | undefined>;
//   createAppointment(appointment: InsertAppointment): Promise<Appointment>;
//   updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
//   deleteAppointment(id: number): Promise<boolean>;
//   getAvailableTimeSlots(doctorId: number, date: string): Promise<string[]>;

//   // Notification Settings
//   getNotificationSettings(patientId: number): Promise<NotificationSettings | undefined>;
//   updateNotificationSettings(patientId: number, settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings>;
// }

// export class MemStorage implements IStorage {
//   private doctors: Map<number, Doctor>;
//   private patients: Map<number, Patient>;
//   private appointments: Map<number, Appointment>;
//   private notificationSettings: Map<number, NotificationSettings>;
//   private currentDoctorId: number;
//   private currentPatientId: number;
//   private currentAppointmentId: number;
//   private currentNotificationId: number;

//   constructor() {
//     this.doctors = new Map();
//     this.patients = new Map();
//     this.appointments = new Map();
//     this.notificationSettings = new Map();
//     this.currentDoctorId = 1;
//     this.currentPatientId = 1;
//     this.currentAppointmentId = 1;
//     this.currentNotificationId = 1;

//     // Initialize with sample data
//     this.initializeSampleData();
//   }

//   private initializeSampleData() {
//     // Sample doctors
//     const sampleDoctors = [
//       { name: "Dr. Sarah Smith", specialty: "General Medicine", email: "sarah.smith@clinic.com", phone: "+1 (555) 100-0001" },
//       { name: "Dr. Mike Johnson", specialty: "Cardiology", email: "mike.johnson@clinic.com", phone: "+1 (555) 100-0002" },
//       { name: "Dr. Emily Davis", specialty: "Dermatology", email: "emily.davis@clinic.com", phone: "+1 (555) 100-0003" },
//       { name: "Dr. James Wilson", specialty: "Orthopedics", email: "james.wilson@clinic.com", phone: "+1 (555) 100-0004" },
//     ];

//     sampleDoctors.forEach(doctor => {
//       const id = this.currentDoctorId++;
//       this.doctors.set(id, { ...doctor, id });
//     });

//     // Sample patients
//     const samplePatients = [
//       { fullName: "John Doe", email: "john.doe@email.com", phone: "+1 (555) 123-4567", dateOfBirth: "1988-03-15", address: "123 Main St" },
//       { fullName: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 (555) 987-6543", dateOfBirth: "1995-07-22", address: "456 Oak Ave" },
//       { fullName: "Michael Brown", email: "m.brown@email.com", phone: "+1 (555) 456-7890", dateOfBirth: "1978-11-08", address: "789 Pine Rd" },
//       { fullName: "Emma Wilson", email: "emma.w@email.com", phone: "+1 (555) 321-0987", dateOfBirth: "1992-05-30", address: "321 Elm St" },
//     ];

//     samplePatients.forEach(patient => {
//       const id = this.currentPatientId++;
//       this.patients.set(id, { ...patient, id });
//     });

//     // Sample appointments
//     const today = new Date().toISOString().split('T')[0];
//     const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

//     const sampleAppointments = [
//       { patientId: 1, doctorId: 1, date: today, time: "08:00", type: "General Consultation", status: "confirmed", reason: "Routine check-up" },
//       { patientId: 2, doctorId: 2, date: today, time: "10:00", type: "Follow-up", status: "pending", reason: "Cardiology follow-up" },
//       { patientId: 3, doctorId: 3, date: today, time: "14:00", type: "Routine Check-up", status: "confirmed", reason: "Skin examination" },
//       { patientId: 1, doctorId: 1, date: tomorrow, time: "09:00", type: "Follow-up", status: "confirmed", reason: "Follow-up consultation" },
//       { patientId: 4, doctorId: 4, date: tomorrow, time: "11:00", type: "Consultation", status: "cancelled", reason: "Joint pain assessment" },
//     ];

//     sampleAppointments.forEach(appointment => {
//       const id = this.currentAppointmentId++;
//       this.appointments.set(id, { ...appointment, id, createdAt: new Date() });
//     });

//     // Sample notification settings
//     for (let i = 1; i <= 4; i++) {
//       const id = this.currentNotificationId++;
//       this.notificationSettings.set(id, {
//         id,
//         patientId: i,
//         emailEnabled: true,
//         smsEnabled: i % 2 === 0,
//         pushEnabled: true,
//       });
//     }
//   }

//   async getDoctors(): Promise<Doctor[]> {
//     return Array.from(this.doctors.values());
//   }

//   async getDoctor(id: number): Promise<Doctor | undefined> {
//     return this.doctors.get(id);
//   }

//   async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
//     const id = this.currentDoctorId++;
//     const doctor: Doctor = { ...insertDoctor, id };
//     this.doctors.set(id, doctor);
//     return doctor;
//   }

//   async getPatients(): Promise<Patient[]> {
//     return Array.from(this.patients.values());
//   }

//   async getPatient(id: number): Promise<Patient | undefined> {
//     return this.patients.get(id);
//   }

//   async getPatientByEmail(email: string): Promise<Patient | undefined> {
//     return Array.from(this.patients.values()).find(patient => patient.email === email);
//   }

//   async createPatient(insertPatient: InsertPatient): Promise<Patient> {
//     const id = this.currentPatientId++;
//     const patient: Patient = { ...insertPatient, id };
//     this.patients.set(id, patient);
//     return patient;
//   }

//   async getAppointments(): Promise<Appointment[]> {
//     return Array.from(this.appointments.values());
//   }

//   async getAppointmentsWithDetails(): Promise<AppointmentWithDetails[]> {
//     const appointments = Array.from(this.appointments.values());
//     const result: AppointmentWithDetails[] = [];

//     for (const appointment of appointments) {
//       const patient = this.patients.get(appointment.patientId);
//       const doctor = this.doctors.get(appointment.doctorId);

//       if (patient && doctor) {
//         result.push({
//           ...appointment,
//           patient,
//           doctor,
//         });
//       }
//     }

//     return result;
//   }

//   async getAppointmentsByDoctor(doctorId: number, date?: string): Promise<AppointmentWithDetails[]> {
//     const allAppointments = await this.getAppointmentsWithDetails();
//     return allAppointments.filter(appointment =>
//       appointment.doctorId === doctorId &&
//       (!date || appointment.date === date)
//     );
//   }

//   async getAppointmentsByPatient(patientId: number): Promise<AppointmentWithDetails[]> {
//     const allAppointments = await this.getAppointmentsWithDetails();
//     return allAppointments.filter(appointment => appointment.patientId === patientId);
//   }

//   async getAppointment(id: number): Promise<Appointment | undefined> {
//     return this.appointments.get(id);
//   }

//   async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
//     const id = this.currentAppointmentId++;
//     const appointment: Appointment = {
//       ...insertAppointment,
//       id,
//       createdAt: new Date()
//     };
//     this.appointments.set(id, appointment);
//     return appointment;
//   }

//   async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
//     const appointment = this.appointments.get(id);
//     if (!appointment) return undefined;

//     const updatedAppointment = { ...appointment, ...updates };
//     this.appointments.set(id, updatedAppointment);
//     return updatedAppointment;
//   }

//   async deleteAppointment(id: number): Promise<boolean> {
//     return this.appointments.delete(id);
//   }

//   async getAvailableTimeSlots(doctorId: number, date: string): Promise<string[]> {
//     const allSlots = [
//       "08:00", "09:00", "10:00", "11:00",
//       "14:00", "15:00", "16:00", "17:00"
//     ];

//     const appointments = await this.getAppointmentsByDoctor(doctorId, date);
//     const bookedSlots = appointments
//       .filter(apt => apt.status !== "cancelled")
//       .map(apt => apt.time);

//     return allSlots.filter(slot => !bookedSlots.includes(slot));
//   }

//   async getNotificationSettings(patientId: number): Promise<NotificationSettings | undefined> {
//     return Array.from(this.notificationSettings.values())
//       .find(settings => settings.patientId === patientId);
//   }

//   async updateNotificationSettings(patientId: number, updates: Partial<InsertNotificationSettings>): Promise<NotificationSettings> {
//     let settings = Array.from(this.notificationSettings.values())
//       .find(s => s.patientId === patientId);

//     if (!settings) {
//       const id = this.currentNotificationId++;
//       settings = {
//         id,
//         patientId,
//         emailEnabled: true,
//         smsEnabled: false,
//         pushEnabled: true,
//         ...updates,
//       };
//       this.notificationSettings.set(id, settings);
//     } else {
//       settings = { ...settings, ...updates };
//       this.notificationSettings.set(settings.id, settings);
//     }

//     return settings;
//   }
// }

// export class DbStorage implements IStorage {
//   async getDoctors(): Promise<Doctor[]> {
//     return await db.select().from(doctors);
//   }

//   async getDoctor(id: number): Promise<Doctor | undefined> {
//     const result = await db.select().from(doctors).where(eq(doctors.id, id));
//     return result[0];
//   }

//   // Các hàm khác như createPatient, getAppointments... bạn cũng viết tương tự
// }

// export const storage = new MemStorage();

import { db } from "./project_root/db";
import {
  doctors,
  patients,
  appointments,
  notificationSettings,
  UpdatePatient,
  type Doctor,
  type Patient,
  type Appointment,
  type NotificationSettings,
  type InsertDoctor,
  type InsertPatient,
  type InsertAppointment,
  type InsertNotificationSettings,
  type AppointmentWithDetails,
  AppointmentWithDetailsAndNotification,
} from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export class DbStorage {
  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    return db.select().from(doctors);
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    const result = await db.select().from(doctors).where(eq(doctors.id, id));
    return result[0];
  }

  async createDoctor(data: InsertDoctor): Promise<Doctor> {
    await db.insert(doctors).values(data); // insert không trả về gì
    const [newDoctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.email, data.email)); // dùng trường `email` để truy lại

    return newDoctor!;
  }

  // Patients
  async getPatients(): Promise<Patient[]> {
    return db.select().from(patients);
  }

  // Lấy bệnh nhân theo ID
  async getPatientById(id: number) {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, id));
    return patient;
  }

  // Cập nhật thông tin bệnh nhân
  async updatePatient(id: number, data: UpdatePatient) {
    await db.update(patients).set(data).where(eq(patients.id, id));
    return this.getPatientById(id);
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const result = await db.select().from(patients).where(eq(patients.id, id));
    return result[0];
  }

  async getPatientByEmail(email: string): Promise<Patient | undefined> {
    const result = await db
      .select()
      .from(patients)
      .where(eq(patients.email, email));
    return result[0];
  }

  async createPatient(data: InsertPatient): Promise<Patient> {
    await db.insert(patients).values(data); // Chèn dữ liệu
    const [newPatient] = await db
      .select()
      .from(patients)
      .where(eq(patients.email, data.email)); // Tìm lại theo email (unique)

    return newPatient!;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return db.select().from(appointments);
  }

  async getAppointmentsWithDetails(): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        date: appointments.date,
        time: appointments.time,
        type: appointments.type,
        status: appointments.status,
        reason: appointments.reason,
        notes: appointments.notes,
        createdAt: appointments.createdAt,

        // Lấy một vài field cần thiết từ bảng liên quan
        patient: {
          id: patients.id,
          fullName: patients.fullName,
          email: patients.email,
          phone: patients.phone,
          dateOfBirth: patients.dateOfBirth,
          address: patients.address,
        },
        doctor: {
          id: doctors.id,
          name: doctors.name,
          specialty: doctors.specialty,
          email: doctors.email,
          phone: doctors.phone,
        },
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id));

    // Map lại đúng định dạng AppointmentWithDetails
    return result.map((row) => ({
      id: row.id,
      patientId: row.patientId,
      doctorId: row.doctorId,
      date: row.date,
      time: row.time,
      type: row.type,
      status: row.status,
      reason: row.reason,
      notes: row.notes,
      createdAt: row.createdAt,
      patient: row.patient!,
      doctor: row.doctor!,
    }));
  }

  async getAppointmentByIdWithDetails(
    id: number
  ): Promise<AppointmentWithDetailsAndNotification | null> {
    const result = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        date: appointments.date,
        time: appointments.time,
        reason: appointments.reason,
        status: appointments.status,
        type: appointments.type,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        patient: {
          id: patients.id,
          fullName: patients.fullName,
          email: patients.email,
          phone: patients.phone,
          dateOfBirth: patients.dateOfBirth,
          address: patients.address,
        },
        doctor: {
          id: doctors.id,
          name: doctors.name,
          email: doctors.email,
          phone: doctors.phone,
          specialty: doctors.specialty,
        },
        notificationSettings: {
          email_enabled: notificationSettings.emailEnabled,
        },
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(
        notificationSettings,
        eq(patients.id, notificationSettings.patientId)
      )
      .where(eq(appointments.id, id))
      .then((rows) => rows[0]);

    if (!result || !result.patient || !result.doctor) {
      return null;
    }

    return {
      id: result.id,
      patientId: result.patientId,
      doctorId: result.doctorId,
      date: result.date,
      time: result.time,
      reason: result.reason,
      status: result.status,
      type: result.type,
      notes: result.notes,
      createdAt: result.createdAt,
      patient: result.patient,
      doctor: result.doctor,
      notificationSettings: {
        email_enabled: result.notificationSettings?.email_enabled ?? 0,
      },
    } satisfies AppointmentWithDetailsAndNotification;
  }

  async confirmAppointment(appointmentId: number) {
    // Cập nhật trạng thái
    await db
      .update(appointments)
      .set({ status: "confirmed" })
      .where(eq(appointments.id, appointmentId));

    // Trả về thông tin chi tiết (có patient, doctor, notificationSettings)
    return await this.getAppointmentByIdWithDetails(appointmentId);
  }

  async getAppointmentsByDoctor(
    doctorId: number,
    date?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AppointmentWithDetails[]> {
    let conditions;

    if (startDate && endDate) {
      conditions = and(
        eq(appointments.doctorId, doctorId),
        gte(appointments.date, startDate),
        lte(appointments.date, endDate)
      );
    } else if (date) {
      conditions = and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.date, date)
      );
    } else {
      conditions = eq(appointments.doctorId, doctorId);
    }

    const result = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        date: appointments.date,
        time: appointments.time,
        type: appointments.type,
        status: appointments.status,
        reason: appointments.reason,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        patient: {
          id: patients.id,
          fullName: patients.fullName,
          email: patients.email,
          phone: patients.phone,
          dateOfBirth: patients.dateOfBirth,
          address: patients.address,
        },
        doctor: {
          id: doctors.id,
          name: doctors.name,
          specialty: doctors.specialty,
          email: doctors.email,
          phone: doctors.phone,
        },
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(conditions);

    return result.map((row) => ({
      id: row.id,
      patientId: row.patientId,
      doctorId: row.doctorId,
      date: row.date,
      time: row.time,
      type: row.type,
      status: row.status,
      reason: row.reason,
      notes: row.notes,
      createdAt: row.createdAt,
      patient: row.patient!,
      doctor: row.doctor!,
    }));
  }

  async updateAppointmentStatus(id: number, status: string) {
    await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id));
  }

  async getAppointmentsByPatient(
    patientId: number
  ): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        date: appointments.date,
        time: appointments.time,
        type: appointments.type,
        status: appointments.status,
        reason: appointments.reason,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        patient: {
          id: patients.id,
          fullName: patients.fullName,
          email: patients.email,
          phone: patients.phone,
          dateOfBirth: patients.dateOfBirth,
          address: patients.address,
        },
        doctor: {
          id: doctors.id,
          name: doctors.name,
          specialty: doctors.specialty,
          email: doctors.email,
          phone: doctors.phone,
        },
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(eq(appointments.patientId, patientId));

    return result.map((row) => ({
      id: row.id,
      patientId: row.patientId,
      doctorId: row.doctorId,
      date: row.date,
      time: row.time,
      type: row.type,
      status: row.status,
      reason: row.reason,
      notes: row.notes,
      createdAt: row.createdAt,
      patient: row.patient!,
      doctor: row.doctor!,
    }));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const result = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));
    return result[0];
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    await db.insert(appointments).values(data);
    const [newAppointment] = await db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.id))
      .limit(1); // Giả định rằng bản ghi mới nhất là cái vừa chèn

    return newAppointment!;
  }

  // async getAppointmentsByDoctorId(doctorId: number) {
  //   return db.query.appointments.findMany({
  //     where: (appointments, { eq }) => eq(appointments.doctorId, doctorId),
  //     with: {
  //       patient: true,
  //     },
  //     orderBy: (appointments, { asc }) => [
  //       asc(appointments.date),
  //       asc(appointments.time),
  //     ],
  //   });
  // }

  async updateAppointment(
    id: number,
    updates: Partial<Appointment>
  ): Promise<Appointment | undefined> {
    // Cập nhật không trả về gì trong MySQL
    await db
      .update(appointments)
      .set(updates)
      .where(eq(appointments.id, id))
      .execute();

    // Truy vấn lại bản ghi vừa cập nhật
    const [updated] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));

    return updated;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    // Kiểm tra xem bản ghi có tồn tại không
    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));

    if (appointment.length === 0) return false;

    // Xoá bản ghi
    await db.delete(appointments).where(eq(appointments.id, id)).execute();

    return true;
  }

  async getAvailableTimeSlots(
    doctorId: number,
    date: string
  ): Promise<string[]> {
    const allSlots = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];
    const booked = await db
      .select({ time: appointments.time })
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId));

    const bookedTimes = booked.map((b) => b.time);
    return allSlots.filter((slot) => !bookedTimes.includes(slot));
  }

  // Notification Settings
  async getNotificationSettings(
    patientId: number
  ): Promise<NotificationSettings | undefined> {
    const result = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.patientId, patientId));
    return result[0];
  }

  async updateNotificationSettings(
    patientId: number,
    updates: Partial<InsertNotificationSettings>
  ): Promise<NotificationSettings> {
    const existing = await this.getNotificationSettings(patientId);

    if (!existing) {
      // Nếu chưa tồn tại, tạo mới
      await db
        .insert(notificationSettings)
        .values({
          patientId,
          ...updates,
        })
        .execute();

      // Truy vấn lại bản ghi vừa tạo
      const [created] = await db
        .select()
        .from(notificationSettings)
        .where(eq(notificationSettings.patientId, patientId));

      return created!;
    } else {
      // Nếu đã tồn tại, cập nhật bản ghi
      await db
        .update(notificationSettings)
        .set(updates)
        .where(eq(notificationSettings.patientId, patientId))
        .execute();

      // Truy vấn lại bản ghi sau cập nhật
      const [updated] = await db
        .select()
        .from(notificationSettings)
        .where(eq(notificationSettings.patientId, patientId));

      return updated!;
    }
  }
}

export const storage = new DbStorage();
