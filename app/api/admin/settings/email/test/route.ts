import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";

// POST /api/admin/settings/email/test
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { smtpHost, smtpPort, smtpUser, smtpPass } = await req.json();

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send test email
    await transporter.sendMail({
      from: `"E-Commerce Admin" <${smtpUser}>`,
      to: session.user.email,
      subject: "SMTP Configuration Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>SMTP Configuration Test</h2>
          <p>This is a test email to verify your SMTP configuration.</p>
          <p>If you're receiving this email, your SMTP settings are configured correctly.</p>
          <p>Configuration details:</p>
          <ul>
            <li>SMTP Host: ${smtpHost}</li>
            <li>SMTP Port: ${smtpPort}</li>
            <li>SMTP User: ${smtpUser}</li>
          </ul>
        </div>
      `,
    });

    return NextResponse.json({
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { message: "Failed to send test email", error: (error as Error).message },
      { status: 500 }
    );
  }
}