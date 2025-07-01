import type { Doctor, Patient, AppointmentWithDetails, NotificationSettings } from "@shared/schema";

export const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Smith",
    specialty: "General Medicine",
    email: "sarah.smith@clinic.com",
    phone: "+1 (555) 100-0001",
  },
  {
    id: 2,
    name: "Dr. Mike Johnson",
    specialty: "Cardiology",
    email: "mike.johnson@clinic.com",
    phone: "+1 (555) 100-0002",
  },
  {
    id: 3,
    name: "Dr. Emily Davis",
    specialty: "Dermatology",
    email: "emily.davis@clinic.com",
    phone: "+1 (555) 100-0003",
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    email: "james.wilson@clinic.com",
    phone: "+1 (555) 100-0004",
  },
];

export const mockPatients: Patient[] = [
  {
    id: 1,
    fullName: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1988-03-15",
    address: "123 Main St",
  },
  {
    id: 2,
    fullName: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 987-6543",
    dateOfBirth: "1995-07-22",
    address: "456 Oak Ave",
  },
  {
    id: 3,
    fullName: "Michael Brown",
    email: "m.brown@email.com",
    phone: "+1 (555) 456-7890",
    dateOfBirth: "1978-11-08",
    address: "789 Pine Rd",
  },
  {
    id: 4,
    fullName: "Emma Wilson",
    email: "emma.w@email.com",
    phone: "+1 (555) 321-0987",
    dateOfBirth: "1992-05-30",
    address: "321 Elm St",
  },
];

export const mockNotificationSettings: NotificationSettings[] = [
  {
    id: 1,
    patientId: 1,
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
  },
  {
    id: 2,
    patientId: 2,
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
  },
  {
    id: 3,
    patientId: 3,
    emailEnabled: false,
    smsEnabled: false,
    pushEnabled: true,
  },
  {
    id: 4,
    patientId: 4,
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: false,
  },
];

export const getAvailableTimeSlots = (doctorId: number, date: string): string[] => {
  const allSlots = [
    "08:00", "09:00", "10:00", "11:00", 
    "14:00", "15:00", "16:00", "17:00"
  ];
  
  // Mock some booked slots for demonstration
  const bookedSlots = ["09:00", "14:00"];
  
  return allSlots.filter(slot => !bookedSlots.includes(slot));
};
