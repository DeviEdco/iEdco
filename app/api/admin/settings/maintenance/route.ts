import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/settings/maintenance
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { maintenanceMode } = await req.json();

    // Get existing settings
    const existingSettings = await prisma.settings.findFirst();

    // Update or create settings
    const settings = await prisma.settings.upsert({
      where: { id: existingSettings?.id || "1" },
      update: {
        maintenanceMode,
      },
      create: {
        razorpayKeyId: "",
        razorpayKeySecret: "",
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPass: "",
        maintenanceMode,
      },
    });

    return NextResponse.json({
      message: `Maintenance mode ${maintenanceMode ? "enabled" : "disabled"} successfully`,
      data: {
        maintenanceMode: settings.maintenanceMode,
      },
    });
  } catch (error) {
    console.error("Error updating maintenance mode:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}