import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/admin/schemes/[id]
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

    // Get scheme by ID
    const scheme = await prisma.scheme.findUnique({
      where: { id },
    });

    if (!scheme) {
      return NextResponse.json(
        { message: "Scheme not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(scheme);
  } catch (error) {
    console.error("Error fetching scheme:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/schemes/[id]
export async function PUT(
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

    // Check if scheme exists
    const existingScheme = await prisma.scheme.findUnique({
      where: { id },
    });

    if (!existingScheme) {
      return NextResponse.json(
        { message: "Scheme not found" },
        { status: 404 }
      );
    }

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

    // Update scheme
    const updatedScheme = await prisma.scheme.update({
      where: { id },
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

    return NextResponse.json(updatedScheme);
  } catch (error) {
    console.error("Error updating scheme:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/schemes/[id]
export async function DELETE(
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

    // Check if scheme exists
    const existingScheme = await prisma.scheme.findUnique({
      where: { id },
    });

    if (!existingScheme) {
      return NextResponse.json(
        { message: "Scheme not found" },
        { status: 404 }
      );
    }

    // Delete scheme
    await prisma.scheme.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Scheme deleted successfully" });
  } catch (error) {
    console.error("Error deleting scheme:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}