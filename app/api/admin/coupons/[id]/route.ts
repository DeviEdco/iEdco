import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/admin/coupons/[id]
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

    // Get coupon by ID
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/coupons/[id]
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
      code,
      description,
      discountPercentage,
      maxDiscountAmount,
      minOrderValue,
      isActive,
      startDate,
      endDate,
      usageLimit,
    } = await req.json();

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 }
      );
    }

    // Check if another coupon with the same code exists
    if (code !== existingCoupon.code) {
      const duplicateCoupon = await prisma.coupon.findUnique({
        where: { code },
      });

      if (duplicateCoupon) {
        return NextResponse.json(
          { message: "Coupon with this code already exists" },
          { status: 400 }
        );
      }
    }

    // Validate dates
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && end < start) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Update coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        description,
        discountPercentage,
        maxDiscountAmount,
        minOrderValue,
        isActive,
        startDate: start,
        endDate: end,
        usageLimit,
      },
    });

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/coupons/[id]
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

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 }
      );
    }

    // Check if coupon is used in any orders
    const orderCount = await prisma.order.count({
      where: { couponId: id },
    });

    if (orderCount > 0) {
      // Instead of deleting, just deactivate the coupon
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message:
          "Coupon has been used in orders and cannot be deleted. It has been deactivated instead.",
      });
    }

    // Delete coupon
    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
