import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

// POST /api/admin/orders/[id]/refund
export async function POST(
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
    const { amount, reason } = await req.json();

    // Get order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        returnRequest: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

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

    // Process refund
    const refund = await razorpay.payments.refund(order.paymentId, {
      amount: Math.round(amount * 100), // Convert to paise
      notes: {
        reason: reason || "Return approved",
        orderId: order.id,
      },
    });

    // Update order payment status
    await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: "REFUNDED",
      },
    });

    return NextResponse.json({
      message: "Refund processed successfully",
      refund,
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { message: "Failed to process refund" },
      { status: 500 }
    );
  }
}
