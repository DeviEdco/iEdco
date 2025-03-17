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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  ArrowLeft,
  Mail,
  Calendar,
  ShoppingBag,
  MapPin,
  Star,
  Package,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchCustomerById,
  clearSelectedCustomer,
} from "@/lib/redux/features/admin/customersSlice";

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { selectedCustomer, status } = useAppSelector(
    (state) => state.adminCustomers
  );
  const isLoading = status === "loading";
  const customerId = params.id as string;

  useEffect(() => {
    dispatch(fetchCustomerById(customerId));

    return () => {
      dispatch(clearSelectedCustomer());
    };
  }, [dispatch, customerId]);

  if (isLoading || !selectedCustomer) {
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
        <h1 className="text-2xl font-bold">Customer Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={selectedCustomer.image || ""} />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <CardTitle>{selectedCustomer.name || "Anonymous"}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Mail className="h-4 w-4 mr-1" />
                {selectedCustomer.email}
              </CardDescription>
              <div className="mt-2">
                {selectedCustomer.emailVerified ? (
                  <Badge className="bg-green-100 text-green-800">
                    Email Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Email Not Verified
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Joined</span>
                </div>
                <span>
                  {format(new Date(selectedCustomer.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Orders</span>
                </div>
                <Badge variant="secondary">
                  {selectedCustomer._count.orders}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Reviews</span>
                </div>
                <Badge variant="secondary">
                  {selectedCustomer._count.reviews}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href={`/admin/customers/${customerId}/orders`}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                View All Orders
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                The customer's most recent orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCustomer.recentOrders &&
              selectedCustomer.recentOrders.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomer.recentOrders.map((order) => (
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
                          <TableCell className="text-right">
                            ${order.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders found for this customer.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
              <CardDescription>
                Shipping addresses saved by the customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCustomer.addresses &&
              selectedCustomer.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCustomer.addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex items-start mb-2">
                        <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{address.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.street}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.country}
                          </p>
                          <p className="text-sm mt-1">Phone: {address.phone}</p>
                        </div>
                      </div>
                      {address.isDefault && (
                        <Badge className="mt-2 bg-primary/10 text-primary">
                          Default
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No addresses found for this customer.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
