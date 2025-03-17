"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  ArrowLeft,
  Search,
  ShoppingBag,
  Package,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchCustomerById,
  fetchCustomerOrders,
  clearSelectedCustomer,
} from "@/lib/redux/features/admin/customersSlice";

export default function CustomerOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { selectedCustomer, customerOrders, status } = useAppSelector(
    (state) => state.adminCustomers
  );
  const [searchTerm, setSearchTerm] = useState("");
  const isLoading = status === "loading";
  const customerId = params.id as string;

  useEffect(() => {
    dispatch(fetchCustomerById(customerId));
    dispatch(fetchCustomerOrders(customerId));

    return () => {
      dispatch(clearSelectedCustomer());
    };
  }, [dispatch, customerId]);

  // Filter orders based on search term
  const filteredOrders = customerOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.invoiceNumber &&
        order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading && !selectedCustomer) {
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
        <h1 className="text-2xl font-bold">Customer Orders</h1>
      </div>

      {selectedCustomer && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={selectedCustomer.image || ""} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedCustomer.name || "Anonymous"}
                </h2>
                <p className="text-muted-foreground">
                  {selectedCustomer.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>All orders placed by this customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : customerOrders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium hover:underline"
                        >
                          {order.invoiceNumber || order.id.substring(0, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {order.orderItems.length}{" "}
                        {order.orderItems.length === 1 ? "item" : "items"}
                      </TableCell>
                      <TableCell>
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
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${order.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No orders found for this customer.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
