import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/maintenance
export async function GET() {
  try {
    // Get maintenance mode status
    const settings = await prisma.settings.findFirst();
    
    return NextResponse.json({
      maintenanceMode: settings?.maintenanceMode || false,
    });
  } catch (error) {
    console.error("Error fetching maintenance mode:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}