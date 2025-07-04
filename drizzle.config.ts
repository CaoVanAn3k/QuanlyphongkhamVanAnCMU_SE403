import { type Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: "localhost",   // hoặc "127.0.0.1"
    port: 3306,
    user: "root",
    password: "CaoAn7361",         // nếu bạn không đặt password trong XAMPP thì để trống
    database: "quanlyphongkhamVanAn", // tên database bạn tạo trong phpMyAdmin
  },
} satisfies Config;
