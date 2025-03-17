import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import shiprocket from "@/lib/shiprocket";

// GET /api/admin/orders/[id]/tracking
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get tracking details
    const tracking = await shiprocket.trackShipment(id);

    return NextResponse.json(tracking);
  } catch (error: any) {
    console.error("Error tracking shipment:", error);
    return NextResponse.json(
      { message: error.message || "Failed to track shipment" },
      { status: 500 }
    );
  }
}
