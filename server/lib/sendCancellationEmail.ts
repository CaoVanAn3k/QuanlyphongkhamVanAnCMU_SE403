import nodemailer from "nodemailer";

export async function sendCancellationEmail({
  to,
  patientName,
  doctorName,
  date,
  time,
  reason,
  notes,
}: {
  to: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  notes: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Thông báo hủy lịch hẹn khám bệnh",
    html: `
    <h2>Chào ${patientName},</h2>
    <p>Cuộc hẹn với bác sĩ <strong>${doctorName}</strong> vào ngày <strong>${date}</strong> lúc <strong>${time}</strong> đã được <span style="color: red;">hủy</span>.</p>
    <p><strong>Lý do hủy:</strong> ${reason || "Không có lý do cụ thể"}</p>
    <p><strong>Ghi chú bổ sung:</strong> ${notes || "Không có ghi chú"}</p>
    <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ phòng khám để được hỗ trợ.</p>
    <br/>
    <p>Trân trọng,</p>
    <p>Phòng khám ClinicConnect</p>
  `,
  };

  await transporter.sendMail(mailOptions);
}
