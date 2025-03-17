// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { prisma } from "@/lib/prisma";

// // GET /api/admin/dashboard/stats
// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);

//     // Check if user is authenticated and is an admin
//     if (!session || session.user.role !== "ADMIN") {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     // Get total revenue
//     const orders = await prisma.order.findMany({
//       where: {
//         paymentStatus: "PAID",
//       },
//     });

//     const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

//     // Get total customers
//     const totalCustomers = await prisma.user.count({
//       where: {
//         role: "USER",
//       },
//     });

//     // Get total orders
//     const totalOrders = await prisma.order.count();

//     // Get total products
//     const totalProducts = await prisma.product.count();

//     // Get monthly revenue data
//     const currentYear = new Date().getFullYear();
//     const monthlyRevenue = [];

//     for (let month = 0; month < 12; month++) {
//       const startDate = new Date(currentYear, month, 1);
//       const endDate = new Date(currentYear, month + 1, 0);

//       const monthOrders = await prisma.order.findMany({
//         where: {
//           paymentStatus: "PAID",
//           createdAt: {
//             gte: startDate,
//             lte: endDate,
//           },
//         },
//       });

//       const revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

//       monthlyRevenue.push({
//         name: new Date(currentYear, month, 1).toLocaleString('default', { month: 'short' }),
//         revenue: revenue,
//       });
//     }

//     // Get sales by category
//     const categories = await prisma.category.findMany();
//     const categoryData = await Promise.all(
//       categories.map(async (category) => {
//         const products = await prisma.product.findMany({
//           where: {
//             categoryId: category.id,
//           },
//           include: {
//             orderItems: true,
//           },
//         });

//         const sales = products.reduce((sum, product) => {
//           return sum + product.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
//         }, 0);

//         return {
//           name: category.name,
//           value: sales,
//         };
//       })
//     );

//     // Get order status data
//     const orderStatusData = await Promise.all(
//       ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(async (status) => {
//         const count = await prisma.order.count({
//           where: {
//             status: status as any,
//           },
//         });

//         return {
//           name: status,
//           value: count,
//         };
//       })
//     );

//     return NextResponse.json({
//       totalRevenue,
//       totalCustomers,
//       totalOrders,
//       totalProducts,
//       monthlyRevenue,
//       categoryData,
//       orderStatusData,
//     });
//   } catch (error) {
//     console.error("Error fetching dashboard stats:", error);
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

// GET /api/admin/dashboard/stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get total revenue
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Get total customers
    const totalCustomers = await prisma.user.count({
      where: {
        role: "USER",
      },
    });

    // Get total orders
    const totalOrders = await prisma.order.count();

    // Get total products
    const totalProducts = await prisma.product.count();

    // Get monthly revenue data
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      const monthOrders = await prisma.order.findMany({
        where: {
          paymentStatus: "PAID",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

      monthlyRevenue.push({
        name: new Date(currentYear, month, 1).toLocaleString("default", {
          month: "short",
        }),
        revenue: revenue,
      });
    }

    // Get sales by category
    const categories = await prisma.category.findMany();
    const categoryData = await Promise.all(
      categories.map(async (category) => {
        const products = await prisma.product.findMany({
          where: {
            categoryId: category.id,
          },
          include: {
            orderItems: true,
          },
        });

        const sales = products.reduce((sum, product) => {
          return (
            sum +
            product.orderItems.reduce(
              (itemSum, item) => itemSum + item.quantity,
              0
            )
          );
        }, 0);

        return {
          name: category.name,
          value: sales,
        };
      })
    );

    // Get order status data
    const orderStatusData = await Promise.all(
      ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
        async (status) => {
          const count = await prisma.order.count({
            where: {
              status: status as any,
            },
          });

          return {
            name: status,
            value: count,
          };
        }
      )
    );

    return NextResponse.json({
      totalRevenue,
      totalCustomers,
      totalOrders,
      totalProducts,
      monthlyRevenue,
      categoryData,
      orderStatusData,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
