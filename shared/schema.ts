// Đổi từ pg-core sang mysql-core:Định nghĩa bảng bằng Drizzle ORM
import {
  mysqlTable,
  serial,
  varchar,
  text,
  int,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";
import { integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const doctors = mysqlTable("doctors", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
});

export const patients = mysqlTable("patients", {
  id: int("id").primaryKey().autoincrement(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  dateOfBirth: varchar("date_of_birth", { length: 50 }),
  address: text("address"),
});

export const appointments = mysqlTable("appointments", {
  id: int("id").primaryKey().autoincrement(),
  patientId: int("patient_id").notNull(),
  doctorId: int("doctor_id").notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  time: varchar("time", { length: 50 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  status: varchar("status", { length: 100 }).notNull().default("pending"),
  reason: text("reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationSettings = mysqlTable("notification_settings", {
  id: int("id").primaryKey().autoincrement(),
  patientId: int("patient_id").notNull(),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(true),
});

// Zod schemas
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
export const insertNotificationSettingsSchema = createInsertSchema(
  notificationSettings
).omit({ id: true });

export const updatePatientSchema = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  email: z.string().email(),
  phone: z.string(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  // reason: z.string().optional(),
});

export const modalFormSchema = z.object({
  action: z.enum(["reschedule", "cancel"]),
  newDate: z.string().optional(),
  newTime: z.string().optional(),
  cancellationReason: z.string().optional(),
  cancellationNotes: z.string().optional(),
});

// Types
export type Doctor = typeof doctors.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertNotificationSettings = z.infer<
  typeof insertNotificationSettingsSchema
>;

export type UpdatePatient = z.infer<typeof updatePatientSchema>;

export type AppointmentWithDetails = Appointment & {
  patient: Patient;
  doctor: Doctor;
};
export type AppointmentWithDetailsAndNotification = AppointmentWithDetails & {
  notificationSettings: {
    email_enabled: number | boolean;
  };
};
export type ModalFormData = z.infer<typeof modalFormSchema>;

export type DoctorWithStats = Doctor & {
  todayAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
};
