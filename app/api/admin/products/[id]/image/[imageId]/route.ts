import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products/[id]/image/[imageId]
export async function GET(
  req: Request,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { id, imageId } = params;

    // Get image by ID
    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId: id,
      },
    });

    if (!image) {
      return NextResponse.json(
        { message: "Image not found" },
        { status: 404 }
      );
    }

    // Create a response with the image data
    const response = new NextResponse(image.data);
    response.headers.set("Content-Type", "image/jpeg");
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    
    return response;
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]/image/[imageId]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, imageId } = params;

    // Check if image exists
    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId: id,
      },
    });

    if (!image) {
      return NextResponse.json(
        { message: "Image not found" },
        { status: 404 }
      );
    }

    // Delete image
    await prisma.productImage.delete({
      where: {
        id: imageId,
      },
    });

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}