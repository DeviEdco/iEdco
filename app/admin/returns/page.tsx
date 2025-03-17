"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchOrders,
  processReturnRequest,
  initiateRefund,
} from "@/lib/redux/features/admin/ordersSlice";
import {
  ArrowLeftRight,
  Package,
  Search,
  CheckCircle,
  XCircle,
  DollarSign,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export default function ReturnsPage() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { items: orders, status } = useAppSelector(
    (state) => state.adminOrders
  );
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const isLoading = status === "loading";

  useEffect(() => {
    dispatch(fetchOrders({ status: "RETURNED" }));
  }, [dispatch]);

  const handleProcessReturn = async (
    orderId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setIsProcessing(true);
      await dispatch(processReturnRequest({ orderId, status })).unwrap();

      toast({
        title: `Return ${status.toLowerCase()}`,
        description: `The return request has been ${status.toLowerCase()}`,
      });

      if (status === "APPROVED") {
        setSelectedOrder(orderId);
        setShowRefundDialog(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process return request",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedOrder || !refundAmount) return;

    try {
      setIsProcessing(true);
      await dispatch(
        initiateRefund({
          orderId: selectedOrder,
          amount: parseFloat(refundAmount),
          reason: "Return approved",
        })
      ).unwrap();

      setShowRefundDialog(false);
      setSelectedOrder(null);
      setRefundAmount("");

      toast({
        title: "Refund initiated",
        description: "The refund has been initiated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate refund",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.returnRequest &&
      (selectedStatus === "all" ||
        order.returnRequest.status === selectedStatus) &&
      (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Returns Management
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Return Requests</CardTitle>
          <CardDescription>
            Manage customer return requests and process refunds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search returns..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Return Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
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
                        <div>
                          <div className="font-medium">
                            {order.user.name || "Anonymous"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{order.returnRequest?.reason}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            order.returnRequest?.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : order.returnRequest?.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {order.returnRequest?.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(
                            order.returnRequest?.createdAt || order.createdAt
                          ),
                          "MMM d, yyyy"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.returnRequest?.status === "PENDING" && (
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleProcessReturn(order.id, "APPROVED")
                              }
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleProcessReturn(order.id, "REJECTED")
                              }
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {order.returnRequest?.status === "APPROVED" &&
                          order.paymentStatus !== "REFUNDED" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order.id);
                                setRefundAmount(order.total.toString());
                                setShowRefundDialog(true);
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Process Refund
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No return requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Enter the refund amount and confirm to process the refund
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Refund Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRefundDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={isProcessing || !refundAmount}
            >
              {isProcessing ? "Processing..." : "Process Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
