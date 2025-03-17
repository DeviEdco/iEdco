import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/admin/schemes
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get all schemes
    const schemes = await prisma.scheme.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(schemes);
  } catch (error) {
    console.error("Error fetching schemes:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/schemes
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { 
      name, 
      description, 
      discountType, 
      discountValue, 
      freeDelivery, 
      isActive, 
      startDate, 
      endDate 
    } = await req.json();

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Validate discount value for percentage type
    if (discountType === "PERCENTAGE" && discountValue > 100) {
      return NextResponse.json(
        { message: "Percentage discount cannot exceed 100%" },
        { status: 400 }
      );
    }

    // Create new scheme
    const scheme = await prisma.scheme.create({
      data: {
        name,
        description,
        discountType,
        discountValue,
        freeDelivery,
        isActive,
        startDate: start,
        endDate: end,
      },
    });

    return NextResponse.json(scheme, { status: 201 });
  } catch (error) {
    console.error("Error creating scheme:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}