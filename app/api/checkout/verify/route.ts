import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "@/lib/email";

// POST /api/checkout/verify
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    // Get Razorpay settings
    const settings = await prisma.settings.findFirst();
    
    if (!settings?.razorpayKeySecret) {
      return NextResponse.json(
        { message: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", settings.razorpayKeySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Find order by payment ID
    const order = await prisma.order.findFirst({
      where: { paymentId: razorpayOrderId },
      include: {
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order belongs to the user
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "PROCESSING",
        invoiceNumber: `INV-${Date.now()}`,
      },
    });

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(order.user.email, updatedOrder);
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      invoiceNumber: updatedOrder.invoiceNumber,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}