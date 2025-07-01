import { 
  doctors, 
  patients, 
  appointments, 
  notificationSettings,
  type Doctor, 
  type Patient, 
  type Appointment, 
  type NotificationSettings,
  type InsertDoctor, 
  type InsertPatient, 
  type InsertAppointment, 
  type InsertNotificationSettings,
  type AppointmentWithDetails
} from "@shared/schema";

export interface IStorage {
  // Doctors
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;

  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByEmail(email: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsWithDetails(): Promise<AppointmentWithDetails[]>;
  getAppointmentsByDoctor(doctorId: number, date?: string): Promise<AppointmentWithDetails[]>;
  getAppointmentsByPatient(patientId: number): Promise<AppointmentWithDetails[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  getAvailableTimeSlots(doctorId: number, date: string): Promise<string[]>;

  // Notification Settings
  getNotificationSettings(patientId: number): Promise<NotificationSettings | undefined>;
  updateNotificationSettings(patientId: number, settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings>;
}

export class MemStorage implements IStorage {
  private doctors: Map<number, Doctor>;
  private patients: Map<number, Patient>;
  private appointments: Map<number, Appointment>;
  private notificationSettings: Map<number, NotificationSettings>;
  private currentDoctorId: number;
  private currentPatientId: number;
  private currentAppointmentId: number;
  private currentNotificationId: number;

  constructor() {
    this.doctors = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.notificationSettings = new Map();
    this.currentDoctorId = 1;
    this.currentPatientId = 1;
    this.currentAppointmentId = 1;
    this.currentNotificationId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample doctors
    const sampleDoctors = [
      { name: "Dr. Sarah Smith", specialty: "General Medicine", email: "sarah.smith@clinic.com", phone: "+1 (555) 100-0001" },
      { name: "Dr. Mike Johnson", specialty: "Cardiology", email: "mike.johnson@clinic.com", phone: "+1 (555) 100-0002" },
      { name: "Dr. Emily Davis", specialty: "Dermatology", email: "emily.davis@clinic.com", phone: "+1 (555) 100-0003" },
      { name: "Dr. James Wilson", specialty: "Orthopedics", email: "james.wilson@clinic.com", phone: "+1 (555) 100-0004" },
    ];

    sampleDoctors.forEach(doctor => {
      const id = this.currentDoctorId++;
      this.doctors.set(id, { ...doctor, id });
    });

    // Sample patients
    const samplePatients = [
      { fullName: "John Doe", email: "john.doe@email.com", phone: "+1 (555) 123-4567", dateOfBirth: "1988-03-15", address: "123 Main St" },
      { fullName: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 (555) 987-6543", dateOfBirth: "1995-07-22", address: "456 Oak Ave" },
      { fullName: "Michael Brown", email: "m.brown@email.com", phone: "+1 (555) 456-7890", dateOfBirth: "1978-11-08", address: "789 Pine Rd" },
      { fullName: "Emma Wilson", email: "emma.w@email.com", phone: "+1 (555) 321-0987", dateOfBirth: "1992-05-30", address: "321 Elm St" },
    ];

    samplePatients.forEach(patient => {
      const id = this.currentPatientId++;
      this.patients.set(id, { ...patient, id });
    });

    // Sample appointments
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    const sampleAppointments = [
      { patientId: 1, doctorId: 1, date: today, time: "08:00", type: "General Consultation", status: "confirmed", reason: "Routine check-up" },
      { patientId: 2, doctorId: 2, date: today, time: "10:00", type: "Follow-up", status: "pending", reason: "Cardiology follow-up" },
      { patientId: 3, doctorId: 3, date: today, time: "14:00", type: "Routine Check-up", status: "confirmed", reason: "Skin examination" },
      { patientId: 1, doctorId: 1, date: tomorrow, time: "09:00", type: "Follow-up", status: "confirmed", reason: "Follow-up consultation" },
      { patientId: 4, doctorId: 4, date: tomorrow, time: "11:00", type: "Consultation", status: "cancelled", reason: "Joint pain assessment" },
    ];

    sampleAppointments.forEach(appointment => {
      const id = this.currentAppointmentId++;
      this.appointments.set(id, { ...appointment, id, createdAt: new Date() });
    });

    // Sample notification settings
    for (let i = 1; i <= 4; i++) {
      const id = this.currentNotificationId++;
      this.notificationSettings.set(id, {
        id,
        patientId: i,
        emailEnabled: true,
        smsEnabled: i % 2 === 0,
        pushEnabled: true,
      });
    }
  }

  async getDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = this.currentDoctorId++;
    const doctor: Doctor = { ...insertDoctor, id };
    this.doctors.set(id, doctor);
    return doctor;
  }

  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByEmail(email: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(patient => patient.email === email);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentPatientId++;
    const patient: Patient = { ...insertPatient, id };
    this.patients.set(id, patient);
    return patient;
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentsWithDetails(): Promise<AppointmentWithDetails[]> {
    const appointments = Array.from(this.appointments.values());
    const result: AppointmentWithDetails[] = [];

    for (const appointment of appointments) {
      const patient = this.patients.get(appointment.patientId);
      const doctor = this.doctors.get(appointment.doctorId);
      
      if (patient && doctor) {
        result.push({
          ...appointment,
          patient,
          doctor,
        });
      }
    }

    return result;
  }

  async getAppointmentsByDoctor(doctorId: number, date?: string): Promise<AppointmentWithDetails[]> {
    const allAppointments = await this.getAppointmentsWithDetails();
    return allAppointments.filter(appointment => 
      appointment.doctorId === doctorId && 
      (!date || appointment.date === date)
    );
  }

  async getAppointmentsByPatient(patientId: number): Promise<AppointmentWithDetails[]> {
    const allAppointments = await this.getAppointmentsWithDetails();
    return allAppointments.filter(appointment => appointment.patientId === patientId);
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      createdAt: new Date() 
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const updatedAppointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  async getAvailableTimeSlots(doctorId: number, date: string): Promise<string[]> {
    const allSlots = [
      "08:00", "09:00", "10:00", "11:00", 
      "14:00", "15:00", "16:00", "17:00"
    ];
    
    const appointments = await this.getAppointmentsByDoctor(doctorId, date);
    const bookedSlots = appointments
      .filter(apt => apt.status !== "cancelled")
      .map(apt => apt.time);
    
    return allSlots.filter(slot => !bookedSlots.includes(slot));
  }

  async getNotificationSettings(patientId: number): Promise<NotificationSettings | undefined> {
    return Array.from(this.notificationSettings.values())
      .find(settings => settings.patientId === patientId);
  }

  async updateNotificationSettings(patientId: number, updates: Partial<InsertNotificationSettings>): Promise<NotificationSettings> {
    let settings = Array.from(this.notificationSettings.values())
      .find(s => s.patientId === patientId);

    if (!settings) {
      const id = this.currentNotificationId++;
      settings = {
        id,
        patientId,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        ...updates,
      };
      this.notificationSettings.set(id, settings);
    } else {
      settings = { ...settings, ...updates };
      this.notificationSettings.set(settings.id, settings);
    }

    return settings;
  }
}

export const storage = new MemStorage();
