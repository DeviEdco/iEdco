"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, TruckIcon, FileText } from "lucide-react";
import { format } from "date-fns";

const orderStatusMap: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { 
    label: "Pending", 
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100", 
    icon: Clock 
  },
  PROCESSING: { 
    label: "Processing", 
    color: "bg-blue-100 text-blue-800 hover:bg-blue-100", 
    icon: Package 
  },
  SHIPPED: { 
    label: "Shipped", 
    color: "bg-purple-100 text-purple-800 hover:bg-purple-100", 
    icon: TruckIcon 
  },
  DELIVERED: { 
    label: "Delivered", 
    color: "bg-green-100 text-green-800 hover:bg-green-100", 
    icon: CheckCircle 
  },
  CANCELLED: { 
    label: "Cancelled", 
    color: "bg-red-100 text-red-800 hover:bg-red-100", 
    icon: XCircle 
  },
};

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  PAID: { label: "Paid", color: "bg-green-100 text-green-800 hover:bg-green-100" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800 hover:bg-red-100" },
  REFUNDED: { label: "Refunded", color: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
};

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/user/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Button asChild>
              <Link href="/products">
                Start Shopping
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = orderStatusMap[order.status]?.icon || Package;
            return (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.invoiceNumber || order.id.substring(0, 8)}
                      </CardTitle>
                      <CardDescription>
                        Placed on {format(new Date(order.createdAt), "PPP")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <Badge className={orderStatusMap[order.status]?.color}>
                        <StatusIcon className="h-3.5 w-3.5 mr-1" />
                        {orderStatusMap[order.status]?.label || order.status}
                      </Badge>
                      <Badge className={paymentStatusMap[order.paymentStatus]?.color}>
                        {paymentStatusMap[order.paymentStatus]?.label || order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
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
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2} className="text-right font-medium">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ${order.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div>
                      <h3 className="font-medium">Shipping Address</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.address.name}, {order.address.street}, {order.address.city}, {order.address.state} {order.address.postalCode}, {order.address.country}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/profile/orders/${order.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}