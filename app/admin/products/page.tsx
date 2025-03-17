// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Package,
//   Plus,
//   Search,
//   MoreHorizontal,
//   Edit,
//   Trash,
//   Download,
//   FileDown,
//   Loader2,
//   Palette,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
// import {
//   fetchProducts,
//   deleteProduct,
//   fetchCategories,
// } from "@/lib/redux/features/admin/productsSlice";
// import { Badge } from "@/components/ui/badge";

// export default function ProductsPage() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const dispatch = useAppDispatch();
//   const {
//     items: products,
//     status,
//     categories,
//   } = useAppSelector((state) => state.adminProducts);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [productToDelete, setProductToDelete] = useState<string | null>(null);
//   const isLoading = status === "loading";

//   useEffect(() => {
//     dispatch(fetchProducts());
//     dispatch(fetchCategories());
//   }, [dispatch]);

//   // Filter products based on search term and category
//   const filteredProducts = products.filter((product) => {
//     const matchesSearch = product.name
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     const matchesCategory =
//       selectedCategory === "" || product.categoryId === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const handleDeleteProduct = (id: string) => {
//     setProductToDelete(id);
//     setIsDeleteDialogOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!productToDelete) return;

//     try {
//       await dispatch(deleteProduct(productToDelete)).unwrap();

//       setIsDeleteDialogOpen(false);
//       setProductToDelete(null);

//       toast({
//         title: "Product deleted",
//         description: "The product has been deleted successfully.",
//       });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to delete product",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleExportPDF = () => {
//     toast({
//       title: "Exporting PDF",
//       description: "Your products data is being exported as PDF.",
//     });
//     // In a real app, this would trigger a PDF download
//   };

//   const handleExportXLSX = () => {
//     toast({
//       title: "Exporting XLSX",
//       description: "Your products data is being exported as XLSX.",
//     });
//     // In a real app, this would trigger an XLSX download
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold tracking-tight">Products</h1>
//         <Link href="/admin/products/new">
//           <Button>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Product
//           </Button>
//         </Link>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Product Management</CardTitle>
//           <CardDescription>
//             Manage your product inventory, prices, and details.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-col md:flex-row gap-4 mb-6">
//             <div className="relative flex-1">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 type="search"
//                 placeholder="Search products..."
//                 className="pl-8"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <Select
//               value={selectedCategory || ""}
//               onValueChange={setSelectedCategory}
//             >
//               <SelectTrigger className="w-full md:w-[180px]">
//                 <SelectValue placeholder="Category" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Categories</SelectItem>{" "}
//                 {/* Use 'all' instead of empty string */}
//                 {categories.map((category) => (
//                   <SelectItem key={category.id} value={category.id}>
//                     {category.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline">
//                   <FileDown className="mr-2 h-4 w-4" />
//                   Export
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuLabel>Export Options</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={handleExportPDF}>
//                   Export as PDF
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={handleExportXLSX}>
//                   Export as XLSX
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Category</TableHead>
//                   <TableHead>Variants</TableHead>
//                   <TableHead className="text-right">Price</TableHead>
//                   <TableHead className="text-right">Stock</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {isLoading ? (
//                   <TableRow>
//                     <TableCell colSpan={6} className="h-24 text-center">
//                       <Loader2 className="h-6 w-6 animate-spin mx-auto" />
//                     </TableCell>
//                   </TableRow>
//                 ) : filteredProducts.length > 0 ? (
//                   filteredProducts.map((product) => (
//                     <TableRow key={product.id}>
//                       <TableCell className="font-medium">
//                         <div className="flex items-center">
//                           {product.images && product.images.length > 0 ? (
//                             <div className="h-10 w-10 rounded bg-muted mr-3 overflow-hidden">
//                               <img
//                                 src={`/api/admin/products/${product.id}/image/${product.images[0].id}`}
//                                 alt={product.name}
//                                 className="h-full w-full object-cover"
//                               />
//                             </div>
//                           ) : (
//                             <div className="h-10 w-10 rounded bg-muted mr-3 flex items-center justify-center">
//                               <Package className="h-5 w-5 text-muted-foreground" />
//                             </div>
//                           )}
//                           <span>{product.name}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>{product.category?.name}</TableCell>
//                       <TableCell>
//                         {product.variants && product.variants.length > 0 ? (
//                           <div className="flex flex-wrap gap-1">
//                             {product.variants.map((variant, index) => (
//                               <Badge
//                                 key={index}
//                                 style={{ backgroundColor: variant.colorCode }}
//                                 className="text-white"
//                               >
//                                 <Palette className="h-3 w-3 mr-1" />
//                                 {variant.color}
//                               </Badge>
//                             ))}
//                           </div>
//                         ) : (
//                           <span className="text-muted-foreground text-sm">
//                             No variants
//                           </span>
//                         )}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         {product.discountPrice ? (
//                           <div>
//                             <span className="text-muted-foreground line-through mr-2">
//                               ${product.price.toFixed(2)}
//                             </span>
//                             <span className="font-medium">
//                               ${product.discountPrice.toFixed(2)}
//                             </span>
//                           </div>
//                         ) : (
//                           <span>${product.price.toFixed(2)}</span>
//                         )}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <span
//                           className={
//                             product.stock < 10
//                               ? "text-red-500 font-medium"
//                               : product.stock < 30
//                               ? "text-yellow-500 font-medium"
//                               : ""
//                           }
//                         >
//                           {product.stock}
//                         </span>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon">
//                               <MoreHorizontal className="h-4 w-4" />
//                               <span className="sr-only">Actions</span>
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem
//                               onClick={() =>
//                                 router.push(`/admin/products/${product.id}`)
//                               }
//                             >
//                               <Edit className="mr-2 h-4 w-4" />
//                               Edit
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => handleDeleteProduct(product.id)}
//                               className="text-red-600"
//                             >
//                               <Trash className="mr-2 h-4 w-4" />
//                               Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell
//                       colSpan={6}
//                       className="h-24 text-center text-muted-foreground"
//                     >
//                       No products found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       <AlertDialog
//         open={isDeleteDialogOpen}
//         onOpenChange={setIsDeleteDialogOpen}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the
//               product from your store.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={confirmDelete}
//               disabled={isLoading}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 "Delete"
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Download,
  FileDown,
  Loader2,
  Palette,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchProducts,
  deleteProduct,
  fetchCategories,
} from "@/lib/redux/features/admin/productsSlice";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";

export default function ProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const {
    items: products,
    status,
    categories,
  } = useAppSelector((state) => state.adminProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const isLoading = status === "loading";

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await dispatch(deleteProduct(productToDelete)).unwrap();

      setIsDeleteDialogOpen(false);
      setProductToDelete(null);

      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
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
      doc.text("Products Report", 14, 22);

      // Add date
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Prepare data for table
      const tableColumn = [
        "Name",
        "Category",
        "Price",
        "Discount",
        "Stock",
        "Variants",
      ];
      const tableRows = filteredProducts.map((product) => [
        product.name,
        product.category?.name || "N/A",
        `$${product.price.toFixed(2)}`,
        product.discountPrice ? `$${product.discountPrice.toFixed(2)}` : "N/A",
        product.stock.toString(),
        product.variants.length.toString(),
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
      doc.save("products-report.pdf");

      toast({
        title: "PDF Exported",
        description: "Products report has been exported as PDF.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export products as PDF.",
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
      const worksheet = workbook.addWorksheet("Products");

      // Add columns
      worksheet.columns = [
        { header: "Name", key: "name", width: 30 },
        { header: "Category", key: "category", width: 20 },
        { header: "Price", key: "price", width: 15 },
        { header: "Discount Price", key: "discountPrice", width: 15 },
        { header: "Stock", key: "stock", width: 10 },
        { header: "Variants", key: "variants", width: 10 },
        { header: "Description", key: "description", width: 50 },
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
      filteredProducts.forEach((product) => {
        worksheet.addRow({
          name: product.name,
          category: product.category?.name || "N/A",
          price: `$${product.price.toFixed(2)}`,
          discountPrice: product.discountPrice
            ? `$${product.discountPrice.toFixed(2)}`
            : "N/A",
          stock: product.stock,
          variants: product.variants.length,
          description: product.description,
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
      a.download = "products-report.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "XLSX Exported",
        description: "Products report has been exported as XLSX.",
      });
    } catch (error) {
      console.error("Error exporting XLSX:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export products as XLSX.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
          <CardDescription>
            Manage your product inventory, prices, and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            <Select
              value={selectedCategory || ""}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>{" "}
                {/* Use 'all' instead of empty string */}
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isExporting || filteredProducts.length === 0}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
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
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 ? (
                            <div className="h-10 w-10 rounded bg-muted mr-3 overflow-hidden">
                              <img
                                src={`/api/admin/products/${product.id}/image/${product.images[0].id}`}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted mr-3 flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <span>{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category?.name}</TableCell>
                      <TableCell>
                        {product.variants && product.variants.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.variants.map((variant, index) => (
                              <Badge
                                key={index}
                                style={{ backgroundColor: variant.colorCode }}
                                className="text-white"
                              >
                                <Palette className="h-3 w-3 mr-1" />
                                {variant.color}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No variants
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.discountPrice ? (
                          <div>
                            <span className="text-muted-foreground line-through mr-2">
                              ${product.price.toFixed(2)}
                            </span>
                            <span className="font-medium">
                              ${product.discountPrice.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span>${product.price.toFixed(2)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            product.stock < 10
                              ? "text-red-500 font-medium"
                              : product.stock < 30
                              ? "text-yellow-500 font-medium"
                              : ""
                          }
                        >
                          {product.stock}
                        </span>
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
                                router.push(`/admin/products/${product.id}`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
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
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product from your store.
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
