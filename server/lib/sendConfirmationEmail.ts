// src/utils/email.ts

import nodemailer from "nodemailer";
export async function sendConfirmationEmail({
  to,
  patientName,
  doctorName,
  date,
  time,
}: {
  to: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log(
    "EMAIL_PASS:",
    process.env.EMAIL_PASS ? "✅ Có pass" : "❌ Thiếu pass"
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Xác nhận lịch khám bệnh",
    html: `
      <p>Xin chào <b>${patientName}</b>,</p>
      <p>Lịch khám của bạn đã được bác sĩ xác nhận.</p>
      <ul>
        <li><b>Bác sĩ:</b> ${doctorName}</li>
        <li><b>Thời gian:</b> ${date} lúc ${time}</li>
      </ul>
      <p>Vui lòng đến đúng giờ. Xin cảm ơn!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
