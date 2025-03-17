import nodemailer from "nodemailer";
import { prisma } from "./prisma";

// Get SMTP settings from database
async function getSmtpSettings() {
  try {
    const settings = await prisma.settings.findFirst();
    
    if (!settings?.smtpHost || !settings?.smtpPort || !settings?.smtpUser || !settings?.smtpPass) {
      // Use default settings if not configured in database
      return {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        user: process.env.SMTP_USER || "test@example.com",
        pass: process.env.SMTP_PASS || "password",
      };
    }
    
    return {
      host: settings.smtpHost,
      port: settings.smtpPort,
      user: settings.smtpUser,
      pass: settings.smtpPass,
    };
  } catch (error) {
    console.error("Error getting SMTP settings:", error);
    // Fallback to environment variables
    return {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER || "test@example.com",
      pass: process.env.SMTP_PASS || "password",
    };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const smtpSettings = await getSmtpSettings();
    
    // For development/testing, log the verification link instead of sending email
    console.log(`Verification link for ${email}: ${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`);
    
    // Check if SMTP settings are properly configured
    if (!smtpSettings.host || !smtpSettings.user || !smtpSettings.pass) {
      console.warn("SMTP settings not properly configured. Skipping email send.");
      return;
    }
    
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.port === 465,
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.pass,
      },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

    await transporter.sendMail({
      from: `"E-Commerce" <${smtpSettings.user}>`,
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your email address</h2>
          <p>Thank you for registering! Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Email
          </a>
          <p>If you didn't request this email, you can safely ignore it.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendOrderConfirmationEmail(email: string, order: any) {
  try {
    const smtpSettings = await getSmtpSettings();
    
    // For development/testing, log instead of sending email
    console.log(`Order confirmation for ${email}: Order #${order.id}`);
    
    // Check if SMTP settings are properly configured
    if (!smtpSettings.host || !smtpSettings.user || !smtpSettings.pass) {
      console.warn("SMTP settings not properly configured. Skipping email send.");
      return;
    }
    
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.port === 465,
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.pass,
      },
    });

    const orderUrl = `${process.env.NEXTAUTH_URL}/orders/${order.id}`;

    await transporter.sendMail({
      from: `"E-Commerce" <${smtpSettings.user}>`,
      to: email,
      subject: `Order Confirmation #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your order!</h2>
          <p>Your order #${order.id} has been received and is being processed.</p>
          <p>Order total: $${order.total.toFixed(2)}</p>
          <a href="${orderUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            View Order Details
          </a>
          <p>If you have any questions, please contact our customer support.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    // Don't throw error to prevent order process from failing
  }
}