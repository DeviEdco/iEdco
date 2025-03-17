// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { prisma } from "@/lib/prisma";

// // POST /api/orders/[id]/cancel
// export async function POST(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     // Check if user is authenticated
//     if (!session) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { id } = params;
//     const { reason } = await req.json();

//     // Get order
//     const order = await prisma.order.findUnique({
//       where: { id },
//       include: {
//         orderItems: true,
//       },
//     });

//     if (!order) {
//       return NextResponse.json({ message: "Order not found" }, { status: 404 });
//     }

//     // Check if order belongs to user
//     if (order.userId !== session.user.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
//     }

//     // Check if order can be cancelled
//     if (!["PENDING", "PROCESSING"].includes(order.status)) {
//       return NextResponse.json(
//         { message: "Order cannot be cancelled at this stage" },
//         { status: 400 }
//       );
//     }

//     // Start a transaction
//     const updatedOrder = await prisma.$transaction(async (prisma) => {
//       // Update order status
//       const order = await prisma.order.update({
//         where: { id },
//         data: {
//           status: "CANCELLED",
//           cancellationReason: reason,
//         },
//       });

//       // Restore product stock
//       for (const item of order.orderItems) {
//         await prisma.product.update({
//           where: { id: item.productId },
//           data: {
//             stock: {
//               increment: item.quantity,
//             },
//           },
//         });
//       }

//       // If order used a coupon, decrement usage count
//       if (order.couponId) {
//         await prisma.coupon.update({
//           where: { id: order.couponId },
//           data: {
//             usageCount: {
//               decrement: 1,
//             },
//           },
//         });
//       }

//       return order;
//     });

//     return NextResponse.json(updatedOrder);
//   } catch (error) {
//     console.error("Error cancelling order:", error);
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

// POST /api/orders/[id]/cancel
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
    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json(
        { message: "Cancellation reason is required" },
        { status: 400 }
      );
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get order with items
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          orderItems: true,
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Check if order belongs to user
      if (order.userId !== session.user.id) {
        throw new Error("Unauthorized");
      }

      // Check if order can be cancelled
      if (!["PENDING", "PROCESSING"].includes(order.status)) {
        throw new Error("Order cannot be cancelled at this stage");
      }

      // Restore product stock
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // If order used a coupon, decrement usage count
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: {
            usageCount: {
              decrement: 1,
            },
          },
        });
      }

      // Update order status and add cancellation reason
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancellationReason: reason,
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  slug: true,
                  images: {
                    take: 1,
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
          address: true,
        },
      });

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error cancelling order:", error);

    // Handle specific error cases
    if (error.message === "Order not found") {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    if (error.message === "Order cannot be cancelled at this stage") {
      return NextResponse.json(
        { message: "Order cannot be cancelled at this stage" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
