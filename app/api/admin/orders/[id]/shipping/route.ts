import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import shiprocket from "@/lib/shiprocket";

// POST /api/admin/orders/[id]/shipping
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
    const { courier_id } = await req.json();

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        address: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Prepare order data for Shiprocket
    const orderData = {
      order_id: order.id,
      order_date: order.createdAt,
      pickup_location: "Primary",
      billing_customer_name: order.address.name,
      billing_last_name: "",
      billing_address: order.address.street,
      billing_city: order.address.city,
      billing_state: order.address.state,
      billing_country: order.address.country,
      billing_pincode: order.address.postalCode,
      billing_email: order.user.email,
      billing_phone: order.address.phone,
      shipping_is_billing: true,
      order_items: order.orderItems.map((item) => ({
        name: item.product.name,
        sku: item.product.id,
        units: item.quantity,
        selling_price: item.price,
        tax: 0,
        hsn: item.product.hsnCode || "",
      })),
      payment_method: order.paymentStatus === "PAID" ? "Prepaid" : "COD",
      sub_total: order.subtotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    // Create shipping order
    const shipment = await shiprocket.createOrder(orderData);

    // Generate AWB
    const awb = await shiprocket.generateAWB(shipment.shipment_id, courier_id);

    // Generate label and manifest
    const label = await shiprocket.generateLabel(shipment.shipment_id);
    const manifest = await shiprocket.generateManifest(shipment.shipment_id);

    // Update order with shipping details
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "SHIPPED",
        shipmentId: shipment.shipment_id.toString(),
        awbNumber: awb.awb_code,
        trackingUrl: awb.tracking_url,
      },
    });

    return NextResponse.json({
      order: updatedOrder,
      shipment,
      awb,
      label,
      manifest,
    });
  } catch (error: any) {
    console.error("Error creating shipment:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create shipment" },
      { status: 500 }
    );
  }
}
