// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardDescription,
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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import {
//   ArrowLeft,
//   Package,
//   MapPin,
//   User,
//   Mail,
//   Phone,
//   Download,
//   Printer,
//   Clock,
//   Truck,
//   CheckCircle,
//   XCircle,
//   Loader2,
// } from "lucide-react";
// import { format } from "date-fns";
// import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
// import {
//   fetchOrderById,
//   updateOrderStatus,
//   clearSelectedOrder,
// } from "@/lib/redux/features/admin/ordersSlice";

// export default function OrderDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const { toast } = useToast();
//   const dispatch = useAppDispatch();
//   const { selectedOrder, status } = useAppSelector(
//     (state) => state.adminOrders
//   );
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [newStatus, setNewStatus] = useState("");
//   const [newPaymentStatus, setNewPaymentStatus] = useState("");
//   const isLoading = status === "loading";
//   const orderId = params.id as string;

//   useEffect(() => {
//     dispatch(fetchOrderById(orderId));

//     return () => {
//       dispatch(clearSelectedOrder());
//     };
//   }, [dispatch, orderId]);

//   useEffect(() => {
//     if (selectedOrder) {
//       setNewStatus(selectedOrder.status);
//       setNewPaymentStatus(selectedOrder.paymentStatus);
//     }
//   }, [selectedOrder]);

//   const handleUpdateStatus = async () => {
//     if (!selectedOrder) return;

//     setIsUpdating(true);
//     try {
//       await dispatch(
//         updateOrderStatus({
//           id: selectedOrder.id,
//           status: newStatus,
//           paymentStatus: newPaymentStatus,
//         })
//       ).unwrap();

//       toast({
//         title: "Order updated",
//         description: "The order status has been updated successfully.",
//       });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update order status",
//         variant: "destructive",
//       });
//     } finally {
//       setIsUpdating(false);
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

//   if (isLoading || !selectedOrder) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center">
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
//             Order #
//             {selectedOrder.invoiceNumber || selectedOrder.id.substring(0, 8)}
//           </h2>
//           <p className="text-muted-foreground">
//             Placed on{" "}
//             {format(
//               new Date(selectedOrder.createdAt),
//               "MMMM d, yyyy 'at' h:mm a"
//             )}
//           </p>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
//           <Button variant="outline" onClick={handlePrintInvoice}>
//             <Printer className="mr-2 h-4 w-4" />
//             Print Invoice
//           </Button>
//           <Button variant="outline" onClick={handleDownloadInvoice}>
//             <Download className="mr-2 h-4 w-4" />
//             Download Invoice
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="md:col-span-2 space-y-6">
//           <Card>
//             <CardHeader className="pb-2">
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
//                     {selectedOrder.orderItems?.map((item) => (
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
//                                 href={`/admin/products/${item.productId}`}
//                                 className="font-medium hover:underline"
//                               >
//                                 {item.product.name}
//                               </Link>
//                               {item.productVariant && (
//                                 <div className="text-xs text-muted-foreground">
//                                   <Badge
//                                     style={{
//                                       backgroundColor:
//                                         item.productVariant.colorCode,
//                                     }}
//                                     className="text-white text-xs"
//                                   >
//                                     {item.productVariant.color}
//                                   </Badge>
//                                   {item.productVariant.size && (
//                                     <span className="ml-2">
//                                       Size: {item.productVariant.size}
//                                     </span>
//                                   )}
//                                 </div>
//                               )}
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
//                     <span>${selectedOrder.total.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Shipping</span>
//                     <span>Free</span>
//                   </div>
//                   <Separator />
//                   <div className="flex justify-between font-bold">
//                     <span>Total</span>
//                     <span>${selectedOrder.total.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle>Order Status</CardTitle>
//               <CardDescription>Update the status of this order</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Order Status</label>
//                   <Select
//                     value={newStatus}
//                     onValueChange={setNewStatus}
//                     disabled={isUpdating}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="PENDING">Pending</SelectItem>
//                       <SelectItem value="PROCESSING">Processing</SelectItem>
//                       <SelectItem value="SHIPPED">Shipped</SelectItem>
//                       <SelectItem value="DELIVERED">Delivered</SelectItem>
//                       <SelectItem value="CANCELLED">Cancelled</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Payment Status</label>
//                   <Select
//                     value={newPaymentStatus}
//                     onValueChange={setNewPaymentStatus}
//                     disabled={isUpdating}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select payment status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="PENDING">Pending</SelectItem>
//                       <SelectItem value="PAID">Paid</SelectItem>
//                       <SelectItem value="FAILED">Failed</SelectItem>
//                       <SelectItem value="REFUNDED">Refunded</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <Button
//                 className="mt-4"
//                 onClick={handleUpdateStatus}
//                 disabled={
//                   isUpdating ||
//                   (newStatus === selectedOrder.status &&
//                     newPaymentStatus === selectedOrder.paymentStatus)
//                 }
//               >
//                 {isUpdating ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Updating...
//                   </>
//                 ) : (
//                   "Update Status"
//                 )}
//               </Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle>Order Timeline</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex">
//                   <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
//                     <CheckCircle className="h-5 w-5 text-green-600" />
//                   </div>
//                   <div>
//                     <p className="font-medium">Order Placed</p>
//                     <p className="text-sm text-muted-foreground">
//                       {format(new Date(selectedOrder.createdAt), "PPP 'at' p")}
//                     </p>
//                   </div>
//                 </div>

//                 {selectedOrder?.paymentStatus === "PAID" && (
//                   <div className="flex">
//                     <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
//                       <CheckCircle className="h-5 w-5 text-green-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium">Payment Confirmed</p>
//                       <p className="text-sm text-muted-foreground">
//                         {format(
//                           new Date(selectedOrder?.updatedAt),
//                           "PPP 'at' p"
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {selectedOrder?.status === "PROCESSING" && (
//                   <div className="flex">
//                     <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
//                       <Package className="h-5 w-5 text-blue-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium">Processing Order</p>
//                       <p className="text-sm text-muted-foreground">
//                         Your order is being processed
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {selectedOrder.status === "SHIPPED" && (
//                   <div className="flex">
//                     <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
//                       <Truck className="h-5 w-5 text-purple-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium">Order Shipped</p>
//                       <p className="text-sm text-muted-foreground">
//                         Your order is on the way
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {selectedOrder?.status === "DELIVERED" && (
//                   <div className="flex">
//                     <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
//                       <CheckCircle className="h-5 w-5 text-green-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium">Order Delivered</p>
//                       <p className="text-sm text-muted-foreground">
//                         Your order has been delivered
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {selectedOrder.status === "CANCELLED" && (
//                   <div className="flex">
//                     <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
//                       <XCircle className="h-5 w-5 text-red-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium">Order Cancelled</p>
//                       <p className="text-sm text-muted-foreground">
//                         Your order has been cancelled
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="space-y-6">
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle>Customer Information</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex items-center">
//                   <User className="h-5 w-5 mr-2 text-muted-foreground" />
//                   <div>
//                     <p className="font-medium">
//                       {selectedOrder.user.name || "Anonymous"}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       {selectedOrder.user.email}
//                     </p>
//                   </div>
//                 </div>
//                 <Button asChild variant="outline" className="w-full">
//                   <Link href={`/admin/customers/${selectedOrder.user.id}`}>
//                     View Customer Profile
//                   </Link>
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle>Shipping Address</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-2">
//                 <div className="flex items-start">
//                   <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
//                   <div>
//                     <p className="font-medium">{selectedOrder.address.name}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {selectedOrder.address.street}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       {selectedOrder.address.city},{" "}
//                       {selectedOrder.address.state}{" "}
//                       {selectedOrder.address.postalCode}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       {selectedOrder.address.country}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center pt-2">
//                   <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
//                   <p className="text-sm">{selectedOrder.address.phone}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle>Order Summary</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Order ID</span>
//                   <span className="font-mono">
//                     {selectedOrder.id.substring(0, 8)}
//                   </span>
//                 </div>
//                 {selectedOrder.invoiceNumber && (
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Invoice</span>
//                     <span className="font-mono">
//                       {selectedOrder.invoiceNumber}
//                     </span>
//                   </div>
//                 )}
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Date</span>
//                   <span>
//                     {format(new Date(selectedOrder.createdAt), "MMM d, yyyy")}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Status</span>
//                   <Badge
//                     className={
//                       selectedOrder.status === "DELIVERED"
//                         ? "bg-green-100 text-green-800"
//                         : selectedOrder.status === "SHIPPED"
//                         ? "bg-blue-100 text-blue-800"
//                         : selectedOrder.status === "PROCESSING"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : selectedOrder.status === "CANCELLED"
//                         ? "bg-red-100 text-red-800"
//                         : "bg-gray-100 text-gray-800"
//                     }
//                   >
//                     <div className="flex items-center">
//                       {getStatusIcon(selectedOrder.status)}
//                       {selectedOrder.status}
//                     </div>
//                   </Badge>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Payment</span>
//                   <Badge
//                     className={
//                       selectedOrder.paymentStatus === "PAID"
//                         ? "bg-green-100 text-green-800"
//                         : selectedOrder.paymentStatus === "PENDING"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : selectedOrder.paymentStatus === "FAILED"
//                         ? "bg-red-100 text-red-800"
//                         : "bg-gray-100 text-gray-800"
//                     }
//                   >
//                     {selectedOrder.paymentStatus}
//                   </Badge>
//                 </div>
//                 <Separator className="my-2" />
//                 <div className="flex justify-between font-bold">
//                   <span>Total</span>
//                   <span>${selectedOrder.total.toFixed(2)}</span>
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Mail,
  Phone,
  Download,
  Printer,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchOrderById,
  updateOrderStatus,
  clearSelectedOrder,
} from "@/lib/redux/features/admin/ordersSlice";

const orderStatusMap = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  SHIPPED: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const paymentStatusMap = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Paid", color: "bg-green-100 text-green-800" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Refunded", color: "bg-gray-100 text-gray-800" },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { selectedOrder, status } = useAppSelector(
    (state) => state.adminOrders
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const isLoading = status === "loading";
  const orderId = params.id as string;

  useEffect(() => {
    dispatch(fetchOrderById(orderId));

    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch, orderId]);

  useEffect(() => {
    if (selectedOrder) {
      setNewStatus(selectedOrder.status);
      setNewPaymentStatus(selectedOrder.paymentStatus);
    }
  }, [selectedOrder]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      await dispatch(
        updateOrderStatus({
          id: selectedOrder.id,
          status: newStatus,
          paymentStatus: newPaymentStatus,
        })
      ).unwrap();

      toast({
        title: "Order updated",
        description: "The order status has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
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

  if (isLoading || !selectedOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
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
            Order #
            {selectedOrder.invoiceNumber || selectedOrder.id.substring(0, 8)}
          </h2>
          <p className="text-muted-foreground">
            Placed on{" "}
            {format(
              new Date(selectedOrder.createdAt),
              "MMMM d, yyyy 'at' h:mm a"
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={handlePrintInvoice}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <Button variant="outline" onClick={handleDownloadInvoice}>
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
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
                    {selectedOrder.orderItems?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {item.product?.images?.[0] ? (
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
                                href={`/admin/products/${item.productId}`}
                                className="font-medium hover:underline"
                              >
                                {item.product?.name || "Unknown Product"}
                              </Link>
                              {item.productVariant && (
                                <div className="text-xs text-muted-foreground">
                                  <Badge
                                    style={{
                                      backgroundColor:
                                        item.productVariant.colorCode,
                                    }}
                                    className="text-white text-xs"
                                  >
                                    {item.productVariant.color}
                                  </Badge>
                                  {item.productVariant.size && (
                                    <span className="ml-2">
                                      Size: {item.productVariant.size}
                                    </span>
                                  )}
                                </div>
                              )}
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
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Update the status of this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order Status</label>
                  <Select
                    value={newStatus}
                    onValueChange={setNewStatus}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Status</label>
                  <Select
                    value={newPaymentStatus}
                    onValueChange={setNewPaymentStatus}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={handleUpdateStatus}
                disabled={
                  isUpdating ||
                  (newStatus === selectedOrder.status &&
                    newPaymentStatus === selectedOrder.paymentStatus)
                }
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedOrder.createdAt), "PPP 'at' p")}
                    </p>
                  </div>
                </div>

                {selectedOrder.paymentStatus === "PAID" && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Payment Confirmed</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(selectedOrder.updatedAt),
                          "PPP 'at' p"
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {selectedOrder.status === "PROCESSING" && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Processing Order</p>
                      <p className="text-sm text-muted-foreground">
                        Your order is being processed
                      </p>
                    </div>
                  </div>
                )}

                {selectedOrder.status === "SHIPPED" && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Truck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Shipped</p>
                      <p className="text-sm text-muted-foreground">
                        Your order is on the way
                      </p>
                    </div>
                  </div>
                )}

                {selectedOrder.status === "DELIVERED" && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Delivered</p>
                      <p className="text-sm text-muted-foreground">
                        Your order has been delivered
                      </p>
                    </div>
                  </div>
                )}

                {selectedOrder.status === "CANCELLED" && (
                  <div className="flex">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Cancelled</p>
                      <p className="text-sm text-muted-foreground">
                        Your order has been cancelled
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {selectedOrder.user?.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.user?.email}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/admin/customers/${selectedOrder.user?.id}`}>
                    View Customer Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedOrder.address?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.address?.street}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.address?.city},{" "}
                      {selectedOrder.address?.state}{" "}
                      {selectedOrder.address?.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.address?.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-center pt-2">
                  <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                  <p className="text-sm">{selectedOrder.address?.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono">
                    {selectedOrder.id.substring(0, 8)}
                  </span>
                </div>
                {selectedOrder.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-mono">
                      {selectedOrder.invoiceNumber}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>
                    {format(new Date(selectedOrder.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    className={
                      orderStatusMap[selectedOrder.status]?.color ||
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    <div className="flex items-center">
                      {getStatusIcon(selectedOrder.status)}
                      {orderStatusMap[selectedOrder.status]?.label ||
                        selectedOrder.status}
                    </div>
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <Badge
                    className={
                      paymentStatusMap[selectedOrder.paymentStatus]?.color ||
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    {paymentStatusMap[selectedOrder.paymentStatus]?.label ||
                      selectedOrder.paymentStatus}
                  </Badge>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
