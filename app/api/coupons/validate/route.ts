// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { prisma } from "@/lib/prisma";

// // POST /api/coupons/validate
// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     // Check if user is authenticated
//     if (!session) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { code, cartTotal } = await req.json();

//     if (!code) {
//       return NextResponse.json(
//         { message: "Coupon code is required" },
//         { status: 400 }
//       );
//     }

//     // Find the coupon
//     const coupon = await prisma.coupon.findUnique({
//       where: { code },
//     });

//     if (!coupon) {
//       return NextResponse.json(
//         { message: "Invalid coupon code" },
//         { status: 404 }
//       );
//     }

//     // Check if coupon is active
//     if (!coupon.isActive) {
//       return NextResponse.json(
//         { message: "This coupon is no longer active" },
//         { status: 400 }
//       );
//     }

//     // Check if coupon has expired
//     const now = new Date();
//     if (coupon.startDate > now) {
//       return NextResponse.json(
//         { message: "This coupon is not yet active" },
//         { status: 400 }
//       );
//     }

//     if (coupon.endDate && coupon.endDate < now) {
//       return NextResponse.json(
//         { message: "This coupon has expired" },
//         { status: 400 }
//       );
//     }

//     // Check usage limit
//     if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
//       return NextResponse.json(
//         { message: "This coupon has reached its usage limit" },
//         { status: 400 }
//       );
//     }

//     // Check minimum order value
//     if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
//       return NextResponse.json(
//         {
//           message: `This coupon requires a minimum order of $${coupon.minOrderValue.toFixed(
//             2
//           )}`,
//           minOrderValue: coupon.minOrderValue,
//         },
//         { status: 400 }
//       );
//     }

//     // Calculate discount
//     let discount = (cartTotal * coupon.discountPercentage) / 100;

//     // Apply maximum discount if set
//     if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
//       discount = coupon.maxDiscountAmount;
//     }

//     return NextResponse.json({
//       valid: true,
//       coupon: {
//         id: coupon.id,
//         code: coupon.code,
//         discountPercentage: coupon.discountPercentage,
//         maxDiscountAmount: coupon.maxDiscountAmount,
//       },
//       discount: parseFloat(discount.toFixed(2)),
//       message: "Coupon applied successfully",
//     });
//   } catch (error) {
//     console.error("Error validating coupon:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// POST /api/coupons/validate
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { code, cartTotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { message: "Coupon code is required" },
        { status: 400 }
      );
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { message: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    // Check if coupon has expired
    const now = new Date();
    if (coupon.startDate > now) {
      return NextResponse.json(
        { message: "This coupon is not yet active" },
        { status: 400 }
      );
    }

    if (coupon.endDate && coupon.endDate < now) {
      return NextResponse.json(
        { message: "This coupon has expired" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { message: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    // Check minimum order value
    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          message: `This coupon requires a minimum order of $${coupon.minOrderValue.toFixed(
            2
          )}`,
          minOrderValue: coupon.minOrderValue,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = (cartTotal * coupon.discountPercentage) / 100;

    // Apply maximum discount if set
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
      discount: parseFloat(discount.toFixed(2)),
      message: "Coupon applied successfully",
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
