"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  Search,
  FileDown,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  User,
  Package,
  Calendar,
  Loader2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchReviews,
  updateReviewApproval,
  deleteReview,
} from "@/lib/redux/features/admin/reviewsSlice";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";
export default function ReviewsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { items: reviews, status } = useAppSelector(
    (state) => state.adminReviews
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const isLoading = status === "loading";

  useEffect(() => {
    dispatch(fetchReviews());
  }, [dispatch]);

  // Filter reviews based on search term, status, and rating
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "approved" && review.isApproved) ||
      (selectedStatus === "pending" && !review.isApproved);

    const matchesRating =
      selectedRating === "all" || review.rating === parseInt(selectedRating);

    return matchesSearch && matchesStatus && matchesRating;
  });

  const handleSearch = () => {
    dispatch(
      fetchReviews({
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        rating: selectedRating !== "all" ? selectedRating : undefined,
      })
    );
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    dispatch(
      fetchReviews({
        status: status !== "all" ? status : undefined,
        rating: selectedRating !== "all" ? selectedRating : undefined,
      })
    );
  };

  const handleRatingChange = (rating: string) => {
    setSelectedRating(rating);
    dispatch(
      fetchReviews({
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        rating: rating !== "all" ? rating : undefined,
      })
    );
  };

  const handleApprovalToggle = async (id: string, currentStatus: boolean) => {
    try {
      await dispatch(
        updateReviewApproval({ id, isApproved: !currentStatus })
      ).unwrap();

      toast({
        title: `Review ${currentStatus ? "unapproved" : "approved"}`,
        description: `The review has been ${
          currentStatus ? "unapproved" : "approved"
        } successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update review status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setReviewToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      await dispatch(deleteReview(reviewToDelete)).unwrap();

      setIsDeleteDialogOpen(false);
      setReviewToDelete(null);

      toast({
        title: "Review deleted",
        description: "The review has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);

      // Create a new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text("Reviews Report", 14, 22);

      // Add date
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Prepare data for table
      const tableColumn = [
        "id",
        "Name",
        "Email",
        "Comment",
        "Product",
        "Created At",
      ];
      const tableRows = filteredReviews.map((reviews) => [
        reviews.id,
        reviews.user?.name || "N/A",
        reviews.user?.email,
        reviews.comment,
        reviews.product.name,
        reviews.createdAt,
        ,
      ]);

      // Add table to document
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [51, 51, 51],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 40 },
      });

      // Save the PDF
      doc.save("Reviews-report.pdf");

      toast({
        title: "PDF Exported",
        description: "Customers report has been exported as PDF.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export categories as PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  const handleExportXLSX = async () => {
    try {
      setIsExporting(true);

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Customers");

      // Add columns
      worksheet.columns = [
        { header: "Id", key: "id", width: 30 },
        { header: "Name", key: "name", width: 30 },
        { header: "Email", key: "email", width: 50 },
        { header: "Comment", key: "comment", width: 50 },
        { header: "Product", key: "product", width: 15 },
        { header: "Created At", key: "createdAt", width: 20 },
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF333333" },
      };
      worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

      // Add data
      filteredReviews.forEach((reviews) => {
        worksheet.addRow({
          id: reviews.id,
          name: reviews.user?.name || "N/A",
          email: reviews.user?.email,
          comment: reviews.comment,
          product: reviews.product.name,
          createdAt: new Date(reviews.createdAt).toLocaleString(),
        });
      });

      // Apply some styling
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          if (rowNumber % 2 === 0) {
            row.eachCell((cell) => {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF5F5F5" },
              };
            });
          }
        }

        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Create a Blob from the buffer
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Customers-report.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "XLSX Exported",
        description: "Customers report has been exported as XLSX.",
      });
    } catch (error) {
      console.error("Error exporting XLSX:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export categories as XLSX.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Management</CardTitle>
          <CardDescription>
            Manage customer reviews and ratings for your products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reviews..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRating} onValueChange={handleRatingChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportPDF}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportXLSX}>
                  Export as XLSX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
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
                ) : filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={review.user?.image || ""} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {review.user?.name || "Anonymous"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {review.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {review.product?.images &&
                          review.product?.images[0] ? (
                            <div className="h-8 w-8 rounded bg-muted mr-3 overflow-hidden">
                              <img
                                src={`/api/admin/products/${review.product?.id}/image/${review.product?.images[0].id}`}
                                alt={review.product?.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded bg-muted mr-3 flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <Link
                            href={`/admin/products/${review.product?.id}`}
                            className="hover:underline"
                          >
                            {review.product?.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            review.isApproved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {review.isApproved ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {format(new Date(review.createdAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleApprovalToggle(
                                  review.id,
                                  review.isApproved
                                )
                              }
                            >
                              {review.isApproved ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Unapprove
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(review.id)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No reviews found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
