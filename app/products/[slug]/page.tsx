"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/redux/features/cartSlice";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Package, 
  ShoppingCart, 
  Star, 
  ArrowLeft, 
  Plus, 
  Minus, 
  ChevronRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  User,
  Calendar
} from "lucide-react";

const reviewFormSchema = z.object({
  rating: z.number().min(1, { message: "Please select a rating" }).max(5),
  comment: z.string().min(5, { message: "Comment must be at least 5 characters" }),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);
  const slug = params.slug as string;

  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/products/${slug}`);
      setProduct(response.data);
      
      if (response.data.images && response.data.images.length > 0) {
        setSelectedImage(`/api/admin/products/${response.data.id}/image/${response.data.images[0].id}`);
      }
      
      // Check if user has already reviewed this product
      if (status === "authenticated" && response.data.reviews) {
        const existingReview = response.data.reviews.find(
          (review: any) => review.user.id === session?.user.id
        );
        if (existingReview) {
          setUserReview(existingReview);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
      router.push("/products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (product && value > product.stock) {
      toast({
        title: "Maximum stock reached",
        description: `Only ${product.stock} items available`,
        variant: "destructive",
      });
      return;
    }
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        quantity,
        image: selectedImage || "",
      })
    );
    
    toast({
      title: "Added to cart",
      description: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart`,
    });
  };

  const handleSubmitReview = async (data: ReviewFormValues) => {
    if (!product || status !== "authenticated") return;
    
    try {
      setIsSubmittingReview(true);
      const response = await axios.post(`/api/products/${slug}/reviews`, data);
      
      toast({
        title: "Review submitted",
        description: response.data.message,
      });
      
      setIsReviewDialogOpen(false);
      fetchProduct(); // Refresh to show the new review
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-6 bg-muted rounded w-1/3 mt-4"></div>
              <div className="h-24 bg-muted rounded w-full mt-6"></div>
              <div className="h-10 bg-muted rounded w-full mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/products" className="hover:underline">
            Products
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href={`/categories/${product.category.slug}`} className="hover:underline">
            {product.category.name}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image: any) => (
                <div
                  key={image.id}
                  className={`aspect-square bg-muted rounded-md overflow-hidden cursor-pointer border-2 ${
                    selectedImage === `/api/admin/products/${product.id}/image/${image.id}`
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(`/api/admin/products/${product.id}/image/${image.id}`)}
                >
                  <img
                    src={`/api/admin/products/${product.id}/image/${image.id}`}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex mr-2">
              {renderStars(Math.round(product.averageRating || 0))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.reviews?.length || 0} reviews
            </span>
          </div>
          
          <div className="mb-4">
            {product.discountPrice ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">
                  ${product.discountPrice.toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
                <Badge className="ml-2 bg-red-500">
                  Save ${(product.price - product.discountPrice).toFixed(2)}
                </Badge>
              </div>
            ) : (
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Availability: 
              <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {product.stock > 0 ? " In Stock" : " Out of Stock"}
              </span>
              {product.stock > 0 && product.stock < 10 && (
                <span className="text-red-600"> (Only {product.stock} left)</span>
              )}
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <div className="mb-6">
            <h2 className="font-medium mb-2">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>1 year warranty</span>
            </div>
            <div className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>30-day return policy</span>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border rounded-md">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Decrease</span>
              </Button>
              <Input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="h-10 w-16 border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
            
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Category: <Link href={`/categories/${product.category.slug}`} className="text-primary hover:underline">{product.category.name}</Link>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.reviews?.length || 0})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <p>{product.description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>
                      {product.reviews?.length || 0} reviews for this product
                    </CardDescription>
                  </div>
                  {status === "authenticated" && !userReview && (
                    <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="mt-4 md:mt-0">
                          <Star className="mr-2 h-4 w-4" />
                          Write a Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Write a Review</DialogTitle>
                          <DialogDescription>
                            Share your experience with this product
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...reviewForm}>
                          <form
                            onSubmit={reviewForm.handleSubmit(handleSubmitReview)}
                            className="space-y-4"
                          >
                            <FormField
                              control={reviewForm.control}
                              name="rating"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rating</FormLabel>
                                  <FormControl>
                                    <div className="flex space-x-1">
                                      {[1, 2, 3, 4, 5].map((rating) => (
                                        <Star
                                          key={rating}
                                          className={`h-6 w-6 cursor-pointer ${
                                            rating <= field.value
                                              ? "text-yellow-400 fill-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                          onClick={() => field.onChange(rating)}
                                        />
                                      ))}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={reviewForm.control}
                              name="comment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Comment</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Share your experience with this product..."
                                      className="min-h-32"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsReviewDialogOpen(false)}
                                disabled={isSubmittingReview}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isSubmittingReview}>
                                {isSubmittingReview ? "Submitting..." : "Submit Review"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                              {review.user.image ? (
                                <img
                                  src={review.user.image}
                                  alt={review.user.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{review.user.name}</p>
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-muted-foreground mt-2">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No reviews yet</p>
                    {status === "authenticated" ? (
                      <Button onClick={() => setIsReviewDialogOpen(true)}>
                        Be the first to review
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href="/auth/signin">
                          Sign in to write a review
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((relatedProduct: any) => (
              <Card key={relatedProduct.id} className="overflow-hidden">
                <Link href={`/products/${relatedProduct.slug}`}>
                  <div className="aspect-square bg-muted relative overflow-hidden group">
                    {relatedProduct.images && relatedProduct.images[0] ? (
                      <img
                        src={`/api/admin/products/${relatedProduct.id}/image/${relatedProduct.images[0].id}`}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/products/${relatedProduct.slug}`}>
                    <h3 className="font-medium hover:underline">{relatedProduct.name}</h3>
                  </Link>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">${relatedProduct.price.toFixed(2)}</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        dispatch(
                          addToCart({
                            id: relatedProduct.id,
                            name: relatedProduct.name,
                            price: relatedProduct.price,
                            quantity: 1,
                            image: relatedProduct.images && relatedProduct.images[0]
                              ? `/api/admin/products/${relatedProduct.id}/image/${relatedProduct.images[0].id}`
                              : "",
                          })
                        );
                        toast({
                          title: "Added to cart",
                          description: `${relatedProduct.name} has been added to your cart`,
                        });
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}