import type { Express } from "express";
import { createServer, type Server } from "http";

import { storage } from "./storage";
import {
  insertAppointmentSchema,
  insertPatientSchema,
  insertNotificationSettingsSchema,
  updatePatientSchema,
} from "@shared/schema";
import { z } from "zod";
import { sendConfirmationEmail } from "./lib/sendConfirmationEmail";
import { sendCancellationEmail } from "./lib/sendCancellationEmail";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all doctors
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  // Get doctor by ID
  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doctor = await storage.getDoctor(id);

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      res.json(doctor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctor" });
    }
  });

  // Get all patients
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Get patient by email
  app.get("/api/patients/by-email/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const patient = await storage.getPatientByEmail(email);

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  // Create patient
  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid patient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  // Get all appointments with details
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsWithDetails();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get appointments by doctor
  app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const date = req.query.date as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const appointments = await storage.getAppointmentsByDoctor(
        doctorId,
        date,
        startDate,
        endDate
      );
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctor appointments" });
    }
  });

  // gửi email xác nhận

  app.put("/api/appointments/:id/confirm", async (req, res) => {
    const appointmentId = parseInt(req.params.id);
    console.log("⏳ Bắt đầu xác nhận lịch:", appointmentId);
    try {
      const appointment = await storage.confirmAppointment(appointmentId);
      if (!appointment) {
        console.log("Appointment not found");
        return res.status(404).json({ message: "Appointment not found" });
      }
      console.log("Appointment sau khi cập nhật:", appointment.status);
      const { patient, doctor, notificationSettings } = appointment;
      console.log(" Notification settings:", notificationSettings);
      const emailEnabled =
        notificationSettings?.email_enabled === 1 ||
        notificationSettings?.email_enabled === true;

      console.log(" Có bật gửi email không?", emailEnabled);
      if (emailEnabled && patient.email) {
        console.log(" Đang gửi email tới:", patient.email);
        await sendConfirmationEmail({
          to: patient.email,
          patientName: patient.fullName,
          date: appointment.date,
          time: appointment.time,
          doctorName: doctor.name,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error confirming appointment:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/appointments/:id/confirm", async (req, res) => {
    const appointmentId = parseInt(req.params.id);
    try {
      const appointment = await storage.confirmAppointment(appointmentId);
      if (!appointment)
        return res.status(404).json({ message: "Appointment not found" });

      const { patient, doctor, notificationSettings } = appointment;

      const emailEnabled = notificationSettings?.email_enabled === 1;

      if (emailEnabled && patient.email) {
        await sendConfirmationEmail({
          to: patient.email,
          patientName: patient.fullName,
          date: appointment.date,
          time: appointment.time,
          doctorName: doctor.name,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error confirming appointment:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get today's appointments for a doctor
  app.get("/api/doctor/:doctorId/today-appointments", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const date = req.query.date as string;

      const appointments = await storage.getAppointmentsByDoctor(
        doctorId,
        date
      );
      res.json(appointments);
    } catch (error) {
      console.error("❌ Error fetching today appointments:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get pending confirmations for a doctor
  app.get("/api/doctor/:doctorId/pending-confirmations", async (req, res) => {
    const doctorId = parseInt(req.params.doctorId);

    try {
      const allAppointments = await storage.getAppointmentsByDoctor(doctorId);
      const pending = allAppointments.filter((a) => a.status === "pending");
      res.json(pending);
    } catch (error) {
      console.error("Error getting pending confirmations:", error);
      res.status(500).json({ message: "Failed to fetch pending" });
    }
  });

  // Get unique patients for a doctor
  app.get("/api/doctor/:doctorId/patients", async (req, res) => {
    const doctorId = parseInt(req.params.doctorId);

    try {
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      const uniquePatientsMap = new Map();
      appointments.forEach((a) => {
        if (a.patient && !uniquePatientsMap.has(a.patient.id)) {
          uniquePatientsMap.set(a.patient.id, a.patient);
        }
      });

      res.json(Array.from(uniquePatientsMap.values()));
    } catch (error) {
      console.error("Error getting patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Get appointments by patient
  app.get("/api/appointments/patient/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const appointments = await storage.getAppointmentsByPatient(patientId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient appointments" });
    }
  });

  // Create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  const updateAppointmentSchema = z.object({
    status: z.enum(["pending", "confirmed", "cancelled"]),
  });
  app.patch("/appointments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const parseResult = updateAppointmentSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid data",
        errors: parseResult.error.flatten(),
      });
    }

    try {
      await storage.updateAppointmentStatus(id, parseResult.data.status);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update appointment", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update appointment
  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const appointment = await storage.updateAppointment(id, updates);

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Delete appointment
  // app.delete("/api/appointments/:id", async (req, res) => {
  //   try {
  //     const id = parseInt(req.params.id);
  //     const deleted = await storage.deleteAppointment(id);

  //     if (!deleted) {
  //       return res.status(404).json({ message: "Appointment not found" });
  //     }

  //     res.json({ message: "Appointment deleted successfully" });
  //   } catch (error) {
  //     res.status(500).json({ message: "Failed to delete appointment" });
  //   }
  // });

  // DELETE /api/appointments/:id
  app.delete("/api/appointments/:id", async (req, res) => {
    const appointmentId = parseInt(req.params.id);
    const { reason, notes } = req.body; // từ frontend gửi lên

    try {
      const appointment = await storage.getAppointmentByIdWithDetails(
        appointmentId
      );
      if (!appointment)
        return res.status(404).json({ message: "Appointment not found" });

      const { patient, doctor, notificationSettings } = appointment;

      // ✅ Xoá cuộc hẹn trong DB
      await storage.deleteAppointment(appointmentId);

      // ✅ Nếu bật email -> gửi thông báo huỷ
      if (notificationSettings?.email_enabled && patient?.email) {
        await sendCancellationEmail({
          to: patient.email,
          patientName: patient.fullName,
          doctorName: doctor.name,
          date: appointment.date,
          time: appointment.time,
          reason,
          notes,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app.post("/api/appointments/:id/cancel", async (req, res) => {
    const appointmentId = parseInt(req.params.id);
    const { reason, notes } = req.body;

    console.log("📨 Hủy cuộc hẹn:", appointmentId);
    console.log("📋 Lý do:", reason);
    console.log("📝 Ghi chú:", notes);

    try {
      const appointment = await storage.getAppointmentByIdWithDetails(
        appointmentId
      );
      if (!appointment)
        return res.status(404).json({ message: "Appointment not found" });

      const { patient, doctor, notificationSettings } = appointment;

      // ✅ Xoá cuộc hẹn
      await storage.deleteAppointment(appointmentId);

      // ✅ Gửi email nếu bật
      if (notificationSettings?.email_enabled && patient?.email) {
        console.log("📧 Gửi email đến:", patient.email);
        await sendCancellationEmail({
          to: patient.email,
          patientName: patient.fullName,
          doctorName: doctor.name,
          date: appointment.date,
          time: appointment.time,
          reason,
          notes,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("❌ Error cancelling appointment:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get available time slots
  app.get(
    "/api/appointments/available-slots/:doctorId/:date",
    async (req, res) => {
      try {
        const doctorId = parseInt(req.params.doctorId);
        const date = req.params.date;
        const slots = await storage.getAvailableTimeSlots(doctorId, date);
        res.json(slots);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch available slots" });
      }
    }
  );

  // Get notification settings
  app.get("/api/notification-settings/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const settings = await storage.getNotificationSettings(patientId);

      if (!settings) {
        return res
          .status(404)
          .json({ message: "Notification settings not found" });
      }

      res.json(settings);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch notification settings" });
    }
  });

  // Update notification settings
  app.patch("/api/notification-settings/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const updates = req.body;
      const settings = await storage.updateNotificationSettings(
        patientId,
        updates
      );
      res.json(settings);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update notification settings" });
    }
  });

  /////////

  app.get("/api/patients/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    try {
      const patient = await storage.getPatientById(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    const parseResult = updatePatientSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid data",
        errors: parseResult.error.flatten(),
      });
    }
    const data = parseResult.data;
    const id = Number(req.params.id);
    const updated = await storage.updatePatient(id, data);
    res.json(updated);
  });

  // app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
  //   const doctorId = Number(req.params.doctorId);

  //   if (!doctorId) {
  //     return res.status(400).json({ message: "Invalid doctor ID" });
  //   }

  //   try {
  //     const appointments = await storage.getAppointmentsByDoctorId(doctorId);
  //     res.json(appointments);
  //   } catch (error) {
  //     res.status(500).json({ message: "Failed to fetch appointments" });
  //   }
  // });

  const httpServer = createServer(app);
  return httpServer;
}
