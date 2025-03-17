// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import axios from "axios";
// import {
//   Card,
//   CardContent,
//   CaardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { useToast } from "@/hooks/use-toast";
// import {
//   ArrowLeft,
//   Package,
//   MapPin,
//   Phone,
//   Download,
//   Printer,
//   Clock,
//   Truck,
//   CheckCircle,
//   XCircle,
//   Loader2,
//   AlertTriangle,
//   ArrowLeftRight,
// } from "lucide-react";
// import { format } from "date-fns";

// export default function OrderDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = useState(true);
//   const [order, setOrder] = useState<any>(null);
//   const orderId = params.id as string;

//   useEffect(() => {
//     fetchOrder();
//   }, [orderId]);

//   const fetchOrder = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get(`/api/user/orders/${orderId}`);
//       setOrder(response.data);
//     } catch (error) {
//       console.error("Error fetching order:", error);
//       toast({
//         title: "Error",
//         description: "Failed to load order details",
//         variant: "destructive",
//       });
//       router.push("/profile/orders");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePrintInvoice = () => {
//     toast({
//       title: "Printing invoice",
//       description: "The invoice is being prepared for printing.",
//     });
//     // In a real app, this would trigger a print dialog
//   };

//   const handleDownloadInvoice = () => {
//     toast({
//       title: "Downloading invoice",
//       description: "The invoice is being downloaded.",
//     });
//     // In a real app, this would trigger a download
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "PENDING":
//         return <Clock className="h-5 w-5 mr-2" />;
//       case "PROCESSING":
//         return <Package className="h-5 w-5 mr-2" />;
//       case "SHIPPED":
//         return <Truck className="h-5 w-5 mr-2" />;
//       case "DELIVERED":
//         return <CheckCircle className="h-5 w-5 mr-2" />;
//       case "CANCELLED":
//         return <XCircle className="h-5 w-5 mr-2" />;
//       default:
//         return null;
//     }
//   };

//   // Check if order is eligible for return (e.g., within 7 days of delivery)
//   const isReturnEligible = (order: any) => {
//     if (order.status !== "DELIVERED") return false;
//     if (order.returnRequest) return false; // Already has a return request

//     const deliveryDate = new Date(order.updatedAt); // Using updatedAt as delivery date
//     const returnWindow = 7; // 7 days return window
//     const today = new Date();
//     const daysSinceDelivery = Math.floor(
//       (today.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
//     );

//     return daysSinceDelivery <= returnWindow;
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="container mx-auto py-10 px-4">
//         <div className="flex items-center mb-6">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => router.back()}
//             className="mr-4"
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>
//           <h1 className="text-2xl font-bold">Order Not Found</h1>
//         </div>
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center h-64">
//             <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
//             <p className="text-muted-foreground mb-4">
//               The order you're looking for doesn't exist or you don't have
//               permission to view it.
//             </p>
//             <Button asChild>
//               <Link href="/profile/orders">View All Orders</Link>
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-10 px-4">
//       <div className="flex items-center mb-6">
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => router.back()}
//           className="mr-4"
//         >
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back
//         </Button>
//         <h1 className="text-2xl font-bold">Order Details</h1>
//       </div>

//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//         <div>
//           <h2 className="text-xl font-semibold">
//             Order #{order.invoiceNumber || order.id.substring(0, 8)}
//           </h2>
//           <p className="text-muted-foreground">
//             Placed on{" "}
//             {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
//           </p>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
//           {order.invoiceNumber && (
//             <>
//               <Button variant="outline" onClick={handlePrintInvoice}>
//                 <Printer className="mr-2 h-4 w-4" />
//                 Print Invoice
//               </Button>
//               <Button variant="outline" onClick={handleDownloadInvoice}>
//                 <Download className="mr-2 h-4 w-4" />
//                 Download Invoice
//               </Button>
//             </>
//           )}
//           {isReturnEligible(order) && (
//             <Button asChild variant="outline">
//               <Link href={`/profile/orders/${order.id}/return`}>
//                 <ArrowLeftRight className="mr-2 h-4 w-4" />
//                 Return Order
//               </Link>
//             </Button>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="md:col-span-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Order Items</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="rounded-md border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Product</TableHead>
//                       <TableHead className="text-right">Price</TableHead>
//                       <TableHead className="text-right">Quantity</TableHead>
//                       <TableHead className="text-right">Total</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {order.orderItems.map((item: any) => (
//                       <TableRow key={item.id}>
//                         <TableCell>
//                           <div className="flex items-center">
//                             {item.product.images && item.product.images[0] ? (
//                               <div className="h-10 w-10 rounded bg-muted mr-3 overflow-hidden">
//                                 <img
//                                   src={`/api/admin/products/${item.productId}/image/${item.product.images[0].id}`}
//                                   alt={item.product.name}
//                                   className="h-full w-full object-cover"
//                                 />
//                               </div>
//                             ) : (
//                               <div className="h-10 w-10 rounded bg-muted mr-3 flex items-center justify-center">
//                                 <Package className="h-5 w-5 text-muted-foreground" />
//                               </div>
//                             )}
//                             <div>
//                               <Link
//                                 href={`/products/${item.product.slug}`}
//                                 className="font-medium hover:underline"
//                               >
//                                 {item.product.name}
//                               </Link>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ${item.price.toFixed(2)}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           {item.quantity}
//                         </TableCell>
//                         <TableCell className="text-right font-medium">
//                           ${(item.price * item.quantity).toFixed(2)}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>

//               <div className="mt-4 flex flex-col items-end">
//                 <div className="w-full md:w-1/3 space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Subtotal</span>
//                     <span>${order.subtotal.toFixed(2)}</span>
//                   </div>
//                   {order.discount > 0 && (
//                     <div className="flex justify-between text-green-600">
//                       <span>Discount</span>
//                       <span>-${order.discount.toFixed(2)}</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Shipping</span>
//                     <span>Free</span>
//                   </div>
//                   <Separator />
//                   <div className="flex justify-between font-bold">
//                     <span>Total</span>
//                     <span>${order.total.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {order.status === "CANCELLED" && order.cancellationReason && (
//             <Card className="mt-6">
//               <CardHeader>
//                 <CardTitle className="flex items-center text-red-600">
//                   <AlertTriangle className="h-5 w-5 mr-2" />
//                   Order Cancelled
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-muted-foreground">
//                   Reason: {order.cancellationReason}
//                 </p>
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         <div className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Order Status</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-muted-foreground">Status</span>
//                   <Badge
//                     className={
//                       order.status === "DELIVERED"
//                         ? "bg-green-100 text-green-800"
//                         : order.status === "SHIPPED"
//                         ? "bg-blue-100 text-blue-800"
//                         : order.status === "PROCESSING"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : order.status === "CANCELLED"
//                         ? "bg-red-100 text-red-800"
//                         : "bg-gray-100 text-gray-800"
//                     }
//                   >
//                     <div className="flex items-center">
//                       {getStatusIcon(order.status)}
//                       {order.status}
//                     </div>
//                   </Badge>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-muted-foreground">Payment</span>
//                   <Badge
//                     className={
//                       order.paymentStatus === "PAID"
//                         ? "bg-green-100 text-green-800"
//                         : order.paymentStatus === "PENDING"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : order.paymentStatus === "FAILED"
//                         ? "bg-red-100 text-red-800"
//                         : "bg-gray-100 text-gray-800"
//                     }
//                   >
//                     {order.paymentStatus}
//                   </Badge>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Shipping Address</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-2">
//                 <div className="flex items-start">
//                   <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
//                   <div>
//                     <p className="font-medium">{order.address.name}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {order.address.street}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       {order.address.city}, {order.address.state}{" "}
//                       {order.address.postalCode}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       {order.address.country}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center pt-2">
//                   <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
//                   <p className="text-sm">{order.address.phone}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Download,
  Printer,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react";
import { format } from "date-fns";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const orderId = params.id as string;

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/user/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
      router.push("/profile/orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    toast({
      title: "Printing invoice",
      description: "The invoice is being prepared for printing.",
    });
    // In a real app, this would trigger a print dialog
  };

  const handleDownloadInvoice = () => {
    toast({
      title: "Downloading invoice",
      description: "The invoice is being downloaded.",
    });
    // In a real app, this would trigger a download
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 mr-2" />;
      case "PROCESSING":
        return <Package className="h-5 w-5 mr-2" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5 mr-2" />;
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 mr-2" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  // Check if order is eligible for return (e.g., within 7 days of delivery)
  const isReturnEligible = (order: any) => {
    if (order.status !== "DELIVERED") return false;
    if (order.returnRequest) return false; // Already has a return request

    const deliveryDate = new Date(order.updatedAt); // Using updatedAt as delivery date
    const returnWindow = 7; // 7 days return window
    const today = new Date();
    const daysSinceDelivery = Math.floor(
      (today.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceDelivery <= returnWindow;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
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
          <h1 className="text-2xl font-bold">Order Not Found</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Button asChild>
              <Link href="/profile/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
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
        <h1 className="text-2xl font-bold">Order Details</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Order #{order.invoiceNumber || order.id.substring(0, 8)}
          </h2>
          <p className="text-muted-foreground">
            Placed on{" "}
            {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          {order.invoiceNumber && (
            <>
              <Button variant="outline" onClick={handlePrintInvoice}>
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
              </Button>
              <Button variant="outline" onClick={handleDownloadInvoice}>
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            </>
          )}
          {isReturnEligible(order) && (
            <Button asChild variant="outline">
              <Link href={`/profile/orders/${order.id}/return`}>
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Return Order
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {item.product.images && item.product.images[0] ? (
                              <div className="h-10 w-10 rounded bg-muted mr-3 overflow-hidden">
                                <img
                                  src={`/api/admin/products/${item.productId}/image/${item.product.images[0].id}`}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded bg-muted mr-3 flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <Link
                                href={`/products/${item.product.slug}`}
                                className="font-medium hover:underline"
                              >
                                {item.product.name}
                              </Link>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-col items-end">
                <div className="w-full md:w-1/3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.status === "CANCELLED" && order.cancellationReason && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Order Cancelled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Reason: {order.cancellationReason}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    className={
                      order.status === "DELIVERED"
                        ? "bg-green-100 text-green-800"
                        : order.status === "SHIPPED"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "PROCESSING"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment</span>
                  <Badge
                    className={
                      order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.paymentStatus === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{order.address.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.street}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.city}, {order.address.state}{" "}
                      {order.address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-center pt-2">
                  <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                  <p className="text-sm">{order.address.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
