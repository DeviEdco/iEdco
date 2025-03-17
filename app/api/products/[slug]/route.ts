import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/[slug]
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Get product by slug with all related data
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          select: {
            id: true,
            url: true,
          },
        },
        reviews: {
          where: {
            isApproved: true,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate average rating
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    // Get related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: {
          not: product.id,
        },
      },
      include: {
        images: {
          select: {
            id: true,
            url: true,
          },
          take: 1,
        },
      },
      take: 4,
    });

    return NextResponse.json({
      ...product,
      averageRating,
      relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}