import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import shiprocket from "@/lib/shiprocket";

// GET /api/shipping/rates
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pickup_postcode = searchParams.get("pickup_postcode");
    const delivery_postcode = searchParams.get("delivery_postcode");
    const weight = searchParams.get("weight");
    const cod = searchParams.get("cod") === "true";

    if (!pickup_postcode || !delivery_postcode || !weight) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get shipping rates
    const rates = await shiprocket.getShippingRates(
      pickup_postcode,
      delivery_postcode,
      parseFloat(weight),
      cod
    );

    return NextResponse.json(rates);
  } catch (error: any) {
    console.error("Error fetching shipping rates:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch shipping rates" },
      { status: 500 }
    );
  }
}
