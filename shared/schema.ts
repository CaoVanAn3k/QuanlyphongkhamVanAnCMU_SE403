import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  reason: text("reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(true),
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
  id: true,
});

export type Doctor = typeof doctors.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;

// Extended types for frontend use
export type AppointmentWithDetails = Appointment & {
  patient: Patient;
  doctor: Doctor;
};

export type DoctorWithStats = Doctor & {
  todayAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
};
