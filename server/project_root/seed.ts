import { db } from "./db";
import * as schema from "../../shared/schema";

async function seed() {
  // Thêm bác sĩ
  await db.insert(schema.doctors).values([
    {
      name: "Dr. Nguyễn Văn An",
      specialty: "Tim mạch",
      email: "vana@example.com",
      phone: "0123456789",
    },
    {
      name: "Dr. Nguyên Thị Mai",
      specialty: "Tim mạch",
      email: "thimai@example.com",
      phone: "0987654321",
    },
    {
      name: "Dr. Trần Thị Binh",
      specialty: "Nội khoa",
      email: "thib@example.com",
      phone: "0987654321",
    },
    {
      name: "Dr. Cao An",
      specialty: "Răng Hàm Mặt",
      email: "an@example.com",
      phone: "0353940610",
    },
    {
      name: "Dr. Cao Thị Hằng",
      specialty: "Răng Hàm Mặt",
      email: "hangb@example.com",
      phone: "0123456789",
    },
  ]);

  // Thêm bệnh nhân
  await db.insert(schema.patients).values([
    {
      fullName: "Ngô Thị Hạnh",
      email: "hanhngo@example.com",
      phone: "0909090909",
      dateOfBirth: "1995-05-10",
      address: "Hà Nội",
    },
    {
      fullName: "Phạm Văn Long",
      email: "longpham@example.com",
      phone: "0988989898",
      dateOfBirth: "1990-11-20",
      address: "TP.HCM",
    },
    {
      fullName: "Trần Văn Bình",
      email: "binh@example.com",
      phone: "0388989898",
      dateOfBirth: "2003-08-16",
      address: "TP.DNẵng",
    },
    {
      fullName: "Huỳnh Thị Mai",
      email: "hinhh@example.com",
      phone: "0188989898",
      dateOfBirth: "2001-08-16",
      address: "TP.DNẵng",
    },
    {
      fullName: "Nguyễn Văn Dũng",
      email: "dung@example.com",
      phone: "0388989898",
      dateOfBirth: "2000-08-12",
      address: "TP.HCM",
    },
  ]);

  // Thêm lịch hẹn
  await db.insert(schema.appointments).values([
    {
      patientId: 1,
      doctorId: 1,
      date: "2025-07-02",
      time: "09:00",
      type: "Khám tổng quát",
      status: "confirmed",
      reason: "Khám định kỳ",
      notes: "Mang theo hồ sơ cũ",
    },
    {
      patientId: 2,
      doctorId: 2,
      date: "2025-07-03",
      time: "14:30",
      type: "Tư vấn nhi khoa",
      status: "pending",
      reason: "Con bị ho",
    },
    {
      patientId: 2,
      doctorId: 2,
      date: "2025-07-03",
      time: "14:30",
      type: "Tư vấn nhi khoa",
      status: "pending",
      reason: "Con bị ho",
    },
  ]);
  await db.insert(schema.notificationSettings).values([
    {
      patientId: 1,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
    },
    {
      patientId: 2,
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: false,
    },
  ]);

  console.log("✅ Seed dữ liệu thành công!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(" Seed lỗi:", err);
  process.exit(1);
});
