import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/admin/settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get settings from database
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await prisma.settings.create({
        data: {
          razorpayKeyId: "",
          razorpayKeySecret: "",
          smtpHost: "",
          smtpPort: 587,
          smtpUser: "",
          smtpPass: "",
          maintenanceMode: false,
        },
      });

      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Update settings
    const settings = await prisma.settings.upsert({
      where: { id: data.id || "1" },
      update: {
        razorpayKeyId: data.razorpayKeyId,
        razorpayKeySecret: data.razorpayKeySecret,
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser,
        smtpPass: data.smtpPass,
        maintenanceMode: data.maintenanceMode,
      },
      create: {
        razorpayKeyId: data.razorpayKeyId || "",
        razorpayKeySecret: data.razorpayKeySecret || "",
        smtpHost: data.smtpHost || "",
        smtpPort: data.smtpPort || 587,
        smtpUser: data.smtpUser || "",
        smtpPass: data.smtpPass || "",
        maintenanceMode: data.maintenanceMode || false,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}