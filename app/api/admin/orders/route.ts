// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { prisma } from "@/lib/prisma";

// // GET /api/admin/orders
// export async function GET(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     // Check if user is authenticated and is an admin
//     if (!session || session.user.role !== "ADMIN") {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const status = searchParams.get("status");
//     const search = searchParams.get("search");

//     // Build filter conditions
//     const where: any = {};

//     if (status && status !== "all") {
//       where.status = status;
//     }

//     if (search) {
//       where.OR = [
//         { id: { contains: search } },
//         { invoiceNumber: { contains: search } },
//         { user: { name: { contains: search, mode: "insensitive" } } },
//         { user: { email: { contains: search, mode: "insensitive" } } },
//       ];
//     }

//     // Get all orders with user and address information
//     const orders = await prisma.order.findMany({
//       where,
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//           }
//         }
//       }
//     }
//     )
//   }
// }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/admin/orders
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build filter conditions
    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { invoiceNumber: { contains: search } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get all orders with user and address information
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        address: true,
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
