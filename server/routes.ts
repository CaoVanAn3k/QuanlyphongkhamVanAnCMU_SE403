import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertPatientSchema, insertNotificationSettingsSchema } from "@shared/schema";
import { z } from "zod";

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
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
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
      const appointments = await storage.getAppointmentsByDoctor(doctorId, date);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctor appointments" });
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
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
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
  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAppointment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Get available time slots
  app.get("/api/appointments/available-slots/:doctorId/:date", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const date = req.params.date;
      const slots = await storage.getAvailableTimeSlots(doctorId, date);
      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available slots" });
    }
  });

  // Get notification settings
  app.get("/api/notification-settings/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const settings = await storage.getNotificationSettings(patientId);
      
      if (!settings) {
        return res.status(404).json({ message: "Notification settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  // Update notification settings
  app.patch("/api/notification-settings/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const updates = req.body;
      const settings = await storage.updateNotificationSettings(patientId, updates);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
