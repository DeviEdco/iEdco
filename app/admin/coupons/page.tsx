"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Ticket,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  FileDown,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "@/lib/redux/features/admin/couponsSlice";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";

const formSchema = z
  .object({
    code: z
      .string()
      .min(3, { message: "Code must be at least 3 characters" })
      .toUpperCase(),
    description: z.string().optional(),
    discountPercentage: z.coerce
      .number()
      .min(1, { message: "Discount must be at least 1%" })
      .max(100, { message: "Discount cannot exceed 100%" }),
    maxDiscountAmount: z.coerce
      .number()
      .min(0, { message: "Maximum discount must be a positive number" })
      .optional()
      .nullable(),
    minOrderValue: z.coerce
      .number()
      .min(0, { message: "Minimum order value must be a positive number" })
      .optional()
      .nullable(),
    usageLimit: z.coerce
      .number()
      .int()
      .min(0, { message: "Usage limit must be a non-negative integer" })
      .optional()
      .nullable(),
    isActive: z.boolean().default(true),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z.date().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate > data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

export default function CouponsPage() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { items: coupons, status } = useAppSelector(
    (state) => state.adminCoupons
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<any>(null);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const isLoading = status === "loading";

  const addForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      description: "",
      discountPercentage: 10,
      maxDiscountAmount: null,
      minOrderValue: null,
      usageLimit: null,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      description: "",
      discountPercentage: 10,
      maxDiscountAmount: null,
      minOrderValue: null,
      usageLimit: null,
      isActive: true,
      startDate: new Date(),
      endDate: null,
    },
  });

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  // Filter coupons based on search term
  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.description &&
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCoupon = async (data: FormValues) => {
    try {
      await dispatch(
        addCoupon({
          ...data,
          code: data.code.toUpperCase(),
        })
      ).unwrap();

      setIsAddDialogOpen(false);
      addForm.reset();

      toast({
        title: "Coupon added",
        description: "The coupon has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add coupon",
        variant: "destructive",
      });
    }
  };

  const handleEditCoupon = async (data: FormValues) => {
    if (!couponToEdit) return;

    try {
      await dispatch(
        updateCoupon({
          id: couponToEdit.id,
          data: {
            ...data,
            code: data.code.toUpperCase(),
          },
        })
      ).unwrap();

      setIsEditDialogOpen(false);
      setCouponToEdit(null);

      toast({
        title: "Coupon updated",
        description: "The coupon has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (coupon: any) => {
    setCouponToEdit(coupon);
    editForm.reset({
      code: coupon.code,
      description: coupon.description || "",
      discountPercentage: coupon.discountPercentage,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minOrderValue: coupon.minOrderValue,
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
      startDate: new Date(coupon.startDate),
      endDate: coupon.endDate ? new Date(coupon.endDate) : null,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCoupon = (id: string) => {
    setCouponToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;

    try {
      await dispatch(deleteCoupon(couponToDelete)).unwrap();

      setIsDeleteDialogOpen(false);
      setCouponToDelete(null);

      toast({
        title: "Coupon deleted",
        description: "The coupon has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await dispatch(
        toggleCouponStatus({ id, isActive: currentStatus })
      ).unwrap();

      toast({
        title: `Coupon ${currentStatus ? "deactivated" : "activated"}`,
        description: `The coupon has been ${
          currentStatus ? "deactivated" : "activated"
        } successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon status",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);

      // Create a new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text("Coupons Report", 14, 22);

      // Add date
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Prepare data for table
      const tableColumn = ["Code", "Discount", "Usage", "Duration", "Status"];
      const tableRows = filteredCoupons.map((coupon) => [
        coupon.code,
        `${coupon.discountPercentage}%${
          coupon.maxDiscountAmount ? ` (Max: $${coupon.maxDiscountAmount})` : ""
        }`,
        `${coupon.usageCount}${
          coupon.usageLimit ? `/${coupon.usageLimit}` : ""
        }`,
        `${format(new Date(coupon.startDate), "MM/dd/yyyy")}${
          coupon.endDate
            ? ` - ${format(new Date(coupon.endDate), "MM/dd/yyyy")}`
            : ""
        }`,
        coupon.isActive ? "Active" : "Inactive",
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
      doc.save("coupons-report.pdf");

      toast({
        title: "PDF Exported",
        description: "Coupons report has been exported as PDF.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export coupons as PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToXLSX = async () => {
    try {
      setIsExporting(true);

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Coupons");

      // Add columns
      worksheet.columns = [
        { header: "Code", key: "code", width: 20 },
        { header: "Description", key: "description", width: 40 },
        { header: "Discount", key: "discount", width: 15 },
        { header: "Max Discount", key: "maxDiscount", width: 15 },
        { header: "Min Order", key: "minOrder", width: 15 },
        { header: "Usage", key: "usage", width: 15 },
        { header: "Start Date", key: "startDate", width: 20 },
        { header: "End Date", key: "endDate", width: 20 },
        { header: "Status", key: "status", width: 15 },
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
      filteredCoupons.forEach((coupon) => {
        worksheet.addRow({
          code: coupon.code,
          description: coupon.description || "N/A",
          discount: `${coupon.discountPercentage}%`,
          maxDiscount: coupon.maxDiscountAmount
            ? `$${coupon.maxDiscountAmount}`
            : "N/A",
          minOrder: coupon.minOrderValue ? `$${coupon.minOrderValue}` : "N/A",
          usage: `${coupon.usageCount}${
            coupon.usageLimit ? `/${coupon.usageLimit}` : ""
          }`,
          startDate: format(new Date(coupon.startDate), "MM/dd/yyyy"),
          endDate: coupon.endDate
            ? format(new Date(coupon.endDate), "MM/dd/yyyy")
            : "N/A",
          status: coupon.isActive ? "Active" : "Inactive",
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
      a.download = "coupons-report.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "XLSX Exported",
        description: "Coupons report has been exported as XLSX.",
      });
    } catch (error) {
      console.error("Error exporting XLSX:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export coupons as XLSX.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Coupon</DialogTitle>
              <DialogDescription>
                Create a new coupon code for your customers.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form
                onSubmit={addForm.handleSubmit(handleAddCoupon)}
                className="space-y-4"
              >
                <FormField
                  control={addForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SUMMER20"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Customers will enter this code at checkout
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Get 20% off your summer purchase"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            placeholder="10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="maxDiscountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Discount Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="50.00"
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : parseFloat(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty for no maximum
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="minOrderValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Value ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="100.00"
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : parseFloat(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty for no minimum
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="usageLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usage Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="100"
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : parseInt(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty for unlimited uses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>No end date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-2 flex justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => field.onChange(null)}
                              >
                                Clear
                              </Button>
                            </div>
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Leave empty for no expiration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={addForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable this coupon
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Coupon"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>{" "}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon Management</CardTitle>
          <CardDescription>
            Manage your store coupons and promotional codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search coupons..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isExporting || filteredCoupons.length === 0}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Export
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToPDF}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToXLSX}>
                  Export as XLSX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
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
                ) : filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <div className="font-mono">{coupon.code}</div>
                            {coupon.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {coupon.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">
                            {coupon.discountPercentage}%
                          </span>
                          {coupon.maxDiscountAmount && (
                            <p className="text-xs text-muted-foreground">
                              Max: ${coupon.maxDiscountAmount.toFixed(2)}
                            </p>
                          )}
                          {coupon.minOrderValue && (
                            <p className="text-xs text-muted-foreground">
                              Min order: ${coupon.minOrderValue.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">
                            {coupon.usageCount}
                          </span>
                          {coupon.usageLimit && (
                            <span className="text-muted-foreground">
                              /{coupon.usageLimit}
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {coupon.orderCount} orders
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {format(new Date(coupon.startDate), "MMM d, yyyy")}
                          </div>
                          {coupon.endDate && (
                            <>
                              <div className="text-muted-foreground">to</div>
                              <div>
                                {format(
                                  new Date(coupon.endDate),
                                  "MMM d, yyyy"
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div
                            className={`h-2.5 w-2.5 rounded-full mr-2 ${
                              coupon.isActive ? "bg-green-500" : "bg-gray-400"
                            }`}
                          ></div>
                          <span>{coupon.isActive ? "Active" : "Inactive"}</span>
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
                              onClick={() => openEditDialog(coupon)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(coupon.id, coupon.isActive)
                              }
                            >
                              <Switch
                                className="mr-2"
                                checked={coupon.isActive}
                                onCheckedChange={() => {}}
                                onClick={(e) => e.stopPropagation()}
                              />
                              {coupon.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
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
                      No coupons found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update the coupon information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditCoupon)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SUMMER20"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Get 20% off your summer purchase"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="maxDiscountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Discount Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="50.00"
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? null : parseFloat(value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for no maximum
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="minOrderValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Value ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="100.00"
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? null : parseFloat(value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for no minimum
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="100"
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? null : parseInt(value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for unlimited uses
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-2 flex justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange(null)}
                            >
                              Clear
                            </Button>
                          </div>
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Leave empty for no expiration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Enable or disable this coupon
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Coupon"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
              coupon.
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
