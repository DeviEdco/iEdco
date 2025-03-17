import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products/[id]
export async function GET(
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

    // Get product by ID with images and variants
    const product = await prisma.product.findUnique({
      where: { id },
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

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id]
export async function PUT(
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
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const slug = formData.get("slug") as string;
    const price = parseFloat(formData.get("price") as string);
    const discountPrice = formData.get("discountPrice") ? 
      parseFloat(formData.get("discountPrice") as string) : 
      null;
    const stock = parseInt(formData.get("stock") as string);
    const hsnCode = formData.get("hsnCode") as string || null;
    const categoryId = formData.get("categoryId") as string;
    const keywordsJson = formData.get("keywords") as string;
    const keywords = keywordsJson ? JSON.parse(keywordsJson) : [];
    const variantsJson = formData.get("variants") as string;
    const variantsData = variantsJson ? JSON.parse(variantsJson) : [];
    const deletedVariantsJson = formData.get("deletedVariants") as string;
    const deletedVariants = deletedVariantsJson ? JSON.parse(deletedVariantsJson) : [];
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if another product with the same slug exists
    if (slug !== existingProduct.slug) {
      const duplicateProduct = await prisma.product.findUnique({
        where: { slug },
      });

      if (duplicateProduct) {
        return NextResponse.json(
          { message: "Another product with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
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

    // Process new images
    const newImages = formData.getAll("newImages") as File[];
    
    if (newImages && newImages.length > 0) {
      for (const image of newImages) {
        const buffer = await image.arrayBuffer();
        const imageData = Buffer.from(buffer);
        
        await prisma.productImage.create({
          data: {
            productId: id,
            url: `product-${id}-${Date.now()}`,
            data: imageData,
          },
        });
      }
    }

    // Process deleted images
    const deletedImagesJson = formData.get("deletedImages") as string;
    
    if (deletedImagesJson) {
      const deletedImages = JSON.parse(deletedImagesJson) as string[];
      
      if (deletedImages.length > 0) {
        await prisma.productImage.deleteMany({
          where: {
            id: {
              in: deletedImages,
            },
          },
        });
      }
    }

    // Delete removed variants
    if (deletedVariants.length > 0) {
      await prisma.productVariant.deleteMany({
        where: {
          id: {
            in: deletedVariants,
          },
        },
      });
    }

    // Process variants
    if (variantsData && variantsData.length > 0) {
      for (let i = 0; i < variantsData.length; i++) {
        const variant = variantsData[i];
        
        if (variant.id) {
          // Update existing variant
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: {
              color: variant.color,
              colorCode: variant.colorCode,
              size: variant.size,
              stock: variant.stock,
            },
          });
          
          // Process new variant images
          const variantNewImages = formData.getAll(`variantNewImages_${i}`) as File[];
          
          if (variantNewImages && variantNewImages.length > 0) {
            for (const image of variantNewImages) {
              const buffer = await image.arrayBuffer();
              const imageData = Buffer.from(buffer);
              
              await prisma.productImage.create({
                data: {
                  variantId: variant.id,
                  url: `variant-${variant.id}-${Date.now()}`,
                  data: imageData,
                },
              });
            }
          }
          
          // Process deleted variant images
          const deletedVariantImagesJson = formData.get(`variantDeletedImages_${i}`) as string;
          
          if (deletedVariantImagesJson) {
            const deletedVariantImages = JSON.parse(deletedVariantImagesJson) as string[];
            
            if (deletedVariantImages.length > 0) {
              await prisma.productImage.deleteMany({
                where: {
                  id: {
                    in: deletedVariantImages,
                  },
                },
              });
            }
          }
        } else {
          // Create new variant
          const createdVariant = await prisma.productVariant.create({
            data: {
              productId: id,
              color: variant.color,
              colorCode: variant.colorCode,
              size: variant.size,
              stock: variant.stock,
            },
          });
          
          // Process new variant images
          const variantNewImages = formData.getAll(`variantNewImages_${i}`) as File[];
          
          if (variantNewImages && variantNewImages.length > 0) {
            for (const image of variantNewImages) {
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
    }

    // Get updated product with all relations
    const finalProduct = await prisma.product.findUnique({
      where: { id },
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

    return NextResponse.json(finalProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product has orders
    const orderItemCount = await prisma.orderItem.count({
      where: {
        productId: id,
      },
    });

    if (orderItemCount > 0) {
      return NextResponse.json(
        { message: "Cannot delete product with associated orders" },
        { status: 400 }
      );
    }

    // Delete product variants (cascade will delete variant images)
    await prisma.productVariant.deleteMany({
      where: {
        productId: id,
      },
    });

    // Delete product images
    await prisma.productImage.deleteMany({
      where: {
        productId: id,
      },
    });

    // Delete product reviews
    await prisma.review.deleteMany({
      where: {
        productId: id,
      },
    });

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}