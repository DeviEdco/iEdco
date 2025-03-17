import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// POST /api/orders/[id]/return
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { reason, description } = await req.json();

    if (!reason) {
      return NextResponse.json(
        { message: "Return reason is required" },
        { status: 400 }
      );
    }

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

    // Check if order belongs to user
    if (order.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Check if order is delivered
    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { message: "Only delivered orders can be returned" },
        { status: 400 }
      );
    }

    // Check if order already has a return request
    if (order.returnRequest) {
      return NextResponse.json(
        { message: "Return request already exists for this order" },
        { status: 400 }
      );
    }

    // Check return window (7 days)
    const deliveryDate = new Date(order.updatedAt); // Using updatedAt as delivery date
    const returnWindow = 7; // 7 days return window
    const today = new Date();
    const daysSinceDelivery = Math.floor(
      (today.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceDelivery > returnWindow) {
      return NextResponse.json(
        { message: "Return window has expired" },
        { status: 400 }
      );
    }

    // Create return request
    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: id,
        reason,
        description,
        status: "PENDING",
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id },
      data: {
        status: "RETURN_REQUESTED",
      },
    });

    return NextResponse.json(returnRequest);
  } catch (error) {
    console.error("Error creating return request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
