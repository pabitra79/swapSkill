import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log(" Initializing email configuration...");

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } =
  process.env;

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
  console.warn(" Missing one or more email environment variables!");
}

  const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  debug: true,
  logger: true,
});

transporter.verify((error:any, success:any) => {
  if (error) {
    console.error(" Email transporter error:", error);
  } else {
    console.log(" Email transporter is ready to send messages");
  }
});
export {transporter};