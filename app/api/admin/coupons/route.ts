import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/admin/coupons
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get all coupons
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add usage information
    const couponsWithUsage = await Promise.all(
      coupons.map(async (coupon) => {
        const orderCount = await prisma.order.count({
          where: { couponId: coupon.id },
        });

        return {
          ...coupon,
          orderCount,
        };
      })
    );

    return NextResponse.json(couponsWithUsage);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupons
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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

    // Check if coupon with same code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { message: "Coupon with this code already exists" },
        { status: 400 }
      );
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

    // Create new coupon
    const coupon = await prisma.coupon.create({
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
        usageCount: 0,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
