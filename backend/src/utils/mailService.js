dotenv.config(); // Add this line at the top
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

export const sendOtpMail = async (email, otp) => {
  // Add these two logs to debug
  console.log("Checking MAIL_USER:", process.env.MAIL_USER);
  console.log("Checking MAIL_PASS:", process.env.MAIL_PASS ? "Password exists" : "Password missing");

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER, 
      pass: process.env.MAIL_PASS 
    }
  });

  const mailOptions = {
    from: `"Getset Gadgets Support" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "OTP for Password Change",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #e30613; text-align: center;">Getset Gadgets</h2>
        <p>You requested to change your password. Your OTP is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 28px; font-weight: bold; color: #e30613;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};