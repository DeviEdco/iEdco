import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    // Build filter conditions
    const where: any = {};

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get all products with their categories and variants
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
          },
          take: 1,
        },
        variants: {
          select: {
            id: true,
            color: true,
            colorCode: true,
            size: true,
            stock: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all categories for filtering
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const slug =
      (formData.get("slug") as string) ||
      name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    const price = parseFloat(formData.get("price") as string);
    const discountPrice = formData.get("discountPrice")
      ? parseFloat(formData.get("discountPrice") as string)
      : null;
    const stock = parseInt(formData.get("stock") as string);
    const hsnCode = (formData.get("hsnCode") as string) || null;
    const categoryId = formData.get("categoryId") as string;
    const keywordsJson = formData.get("keywords") as string;
    const keywords = keywordsJson ? JSON.parse(keywordsJson) : [];
    const variantsJson = formData.get("variants") as string;
    const variants = variantsJson ? JSON.parse(variantsJson) : [];

    // Check if product with same slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: "Product with this slug already exists" },
        { status: 400 }
      );
    }

    // Create new product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        slug,
        price,
        discountPrice,
        stock,
        hsnCode,
        categoryId,
        keywords,
      },
    });

    // Process variants
    if (variants && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];

        // Create variant
        const createdVariant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            color: variant.color,
            colorCode: variant.colorCode,
            size: variant.size || "",
            stock: variant.stock,
          },
        });

        // Process variant images
        const variantImages = formData.getAll(`variantImages_${i}`) as File[];

        if (variantImages && variantImages.length > 0) {
          for (const image of variantImages) {
            const buffer = await image.arrayBuffer();
            const imageData = Buffer.from(buffer);

            await prisma.productImage.create({
              data: {
                variantId: createdVariant.id,
                url: `variant-${createdVariant.id}-${Date.now()}`,
                data: imageData,
              },
            });
          }
        }
      }
    }

    // Process main product images
    const images = formData.getAll("images") as File[];

    if (images && images.length > 0) {
      for (const image of images) {
        const buffer = await image.arrayBuffer();
        const imageData = Buffer.from(buffer);

        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: `product-${product.id}-${Date.now()}`,
            data: imageData,
          },
        });
      }
    }

    // Get the created product with all relations
    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: {
          select: {
            id: true,
            url: true,
          },
        },
        variants: {
          include: {
            images: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
