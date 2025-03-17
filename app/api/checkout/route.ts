// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { prisma } from "@/lib/prisma";
// import Razorpay from "razorpay";

// // POST /api/checkout
// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     // Check if user is authenticated
//     if (!session) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { items, addressId } = await req.json();

//     // Validate items
//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return NextResponse.json(
//         { message: "Invalid items" },
//         { status: 400 }
//       );
//     }

//     // Check if address exists and belongs to the user
//     const address = await prisma.address.findUnique({
//       where: { id: addressId },
//     });

//     if (!address) {
//       return NextResponse.json(
//         { message: "Address not found" },
//         { status: 404 }
//       );
//     }

//     if (address.userId !== session.user.id) {
//       return NextResponse.json(
//         { message: "Unauthorized" },
//         { status: 403 }
//       );
//     }

//     // Fetch products to validate and calculate total
//     const productIds = items.map((item: any) => item.id);
//     const products = await prisma.product.findMany({
//       where: {
//         id: {
//           in: productIds,
//         },
//       },
//     });

//     // Check if all products exist
//     if (products.length !== productIds.length) {
//       return NextResponse.json(
//         { message: "One or more products not found" },
//         { status: 400 }
//       );
//     }

//     // Check stock and calculate total
//     let total = 0;
//     const orderItems = [];

//     for (const item of items) {
//       const product = products.find((p) => p.id === item.id);

//       if (!product) {
//         return NextResponse.json(
//           { message: `Product ${item.id} not found` },
//           { status: 400 }
//         );
//       }

//       if (product.stock < item.quantity) {
//         return NextResponse.json(
//           { message: `Insufficient stock for ${product.name}` },
//           { status: 400 }
//         );
//       }

//       const price = product.discountPrice || product.price;
//       const itemTotal = price * item.quantity;
//       total += itemTotal;

//       orderItems.push({
//         productId: product.id,
//         quantity: item.quantity,
//         price,
//       });
//     }

//     // Get Razorpay settings
//     const settings = await prisma.settings.findFirst();

//     if (!settings?.razorpayKeyId || !settings?.razorpayKeySecret) {
//       return NextResponse.json(
//         { message: "Payment gateway not configured" },
//         { status: 500 }
//       );
//     }

//     // Initialize Razorpay
//     const razorpay = new Razorpay({
//       key_id: settings.razorpayKeyId,
//       key_secret: settings.razorpayKeySecret,
//     });

//     // Create order in database
//     const order = await prisma.order.create({
//       data: {
//         userId: session.user.id,
//         addressId,
//         total,
//         status: "PENDING",
//         paymentStatus: "PENDING",
//         orderItems: {
//           create: orderItems,
//         },
//       },
//       include: {
//         orderItems: true,
//       },
//     });

//     // Create Razorpay order
//     const razorpayOrder = await razorpay.orders.create({
//       amount: Math.round(total * 100), // Razorpay expects amount in paise
//       currency: "INR",
//       receipt: order.id,
//     });

//     // Update order with payment ID
//     await prisma.order.update({
//       where: { id: order.id },
//       data: {
//         paymentId: razorpayOrder.id,
//       },
//     });

//     // Update product stock
//     for (const item of orderItems) {
//       await prisma.product.update({
//         where: { id: item.productId },
//         data: {
//           stock: {
//             decrement: item.quantity,
//           },
//         },
//       });
//     }

//     return NextResponse.json({
//       orderId: order.id,
//       razorpayOrderId: razorpayOrder.id,
//       amount: total,
//       currency: "INR",
//       keyId: settings.razorpayKeyId,
//     });
//   } catch (error) {
//     console.error("Error creating checkout:", error);
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
import Razorpay from "razorpay";

// POST /api/checkout
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { items, addressId, couponId } = await req.json();

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Invalid items" }, { status: 400 });
    }

    // Check if address exists and belongs to the user
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    if (address.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Fetch products to validate and calculate total
    const productIds = items.map((item: any) => item.id);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    // Check if all products exist
    if (products.length !== productIds.length) {
      return NextResponse.json(
        { message: "One or more products not found" },
        { status: 400 }
      );
    }

    // Check stock and calculate total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.id);

      if (!product) {
        return NextResponse.json(
          { message: `Product ${item.id} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const price = product.discountPrice || product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price,
      });
    }

    // Apply coupon if provided
    let discount = 0;
    if (couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });

      if (!coupon) {
        return NextResponse.json(
          { message: "Invalid coupon" },
          { status: 400 }
        );
      }

      // Validate coupon
      const now = new Date();
      if (
        !coupon.isActive ||
        coupon.startDate > now ||
        (coupon.endDate && coupon.endDate < now) ||
        (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) ||
        (coupon.minOrderValue && subtotal < coupon.minOrderValue)
      ) {
        return NextResponse.json(
          { message: "Invalid or expired coupon" },
          { status: 400 }
        );
      }

      // Calculate discount
      discount = (subtotal * coupon.discountPercentage) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    }

    const total = subtotal - discount;

    // Get Razorpay settings
    const settings = await prisma.settings.findFirst();

    if (!settings?.razorpayKeyId || !settings?.razorpayKeySecret) {
      return NextResponse.json(
        { message: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: settings.razorpayKeyId,
      key_secret: settings.razorpayKeySecret,
    });

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        addressId,
        subtotal,
        discount,
        total,
        couponId,
        status: "PENDING",
        paymentStatus: "PENDING",
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: order.id,
    });

    // Update order with payment ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: razorpayOrder.id,
      },
    });

    // Update product stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Update coupon usage if used
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: "INR",
      keyId: settings.razorpayKeyId,
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
