// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// // GET /api/coupons/active
// export async function GET() {
//   try {
//     const now = new Date();

//     // Get all active coupons that are currently valid
//     const activeCoupons = await prisma.coupon.findMany({
//       where: {
//         isActive: true,
//         startDate: { lte: now },
//         OR: [{ endDate: null }, { endDate: { gte: now } }],
//         OR: [
//           { usageLimit: null },
//           { usageCount: { lt: { path: ["usageLimit"] } } },
//         ],
//       },
//       select: {
//         code: true,
//         description: true,
//         discountPercentage: true,
//         maxDiscountAmount: true,
//         minOrderValue: true,
//         endDate: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     // Get active schemes as well
//     const activeSchemes = await prisma.scheme.findMany({
//       where: {
//         isActive: true,
//         startDate: { lte: now },
//         endDate: { gte: now },
//       },
//       select: {
//         name: true,
//         description: true,
//         discountType: true,
//         discountValue: true,
//         freeDelivery: true,
//         endDate: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json({
//       coupons: activeCoupons,
//       schemes: activeSchemes,
//     });
//   } catch (error) {
//     console.error("Error fetching active coupons:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/coupons/active
export async function GET() {
  try {
    const now = new Date();

    // Get all active coupons that are currently valid
    const activeCoupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
        OR: [
          { usageLimit: null },
          { usageCount: { lt: { path: ["usageLimit"] } } },
        ],
      },
      select: {
        code: true,
        description: true,
        discountPercentage: true,
        maxDiscountAmount: true,
        minOrderValue: true,
        endDate: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get active schemes as well
    const activeSchemes = await prisma.scheme.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        name: true,
        description: true,
        discountType: true,
        discountValue: true,
        freeDelivery: true,
        endDate: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      coupons: activeCoupons,
      schemes: activeSchemes,
    });
  } catch (error) {
    console.error("Error fetching active coupons:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
