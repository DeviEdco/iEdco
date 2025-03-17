// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useDropzone } from "react-dropzone";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import {
//   X,
//   Upload,
//   ArrowLeft,
//   Plus,
//   Trash,
//   Palette,
//   Loader2
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
// import {
//   fetchProductById,
//   fetchCategories,
//   updateProduct,
//   clearSelectedProduct
// } from "@/lib/redux/features/admin/productsSlice";

// const colorVariantSchema = z.object({
//   id: z.string().optional(),
//   color: z.string().min(1, { message: "Color name is required" }),
//   colorCode: z.string().min(1, { message: "Color code is required" }),
//   size: z.string().optional(),
//   stock: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer" }),
//   images: z.array(z.any()).optional(),
//   newImages: z.array(z.instanceof(File)).optional(),
//   deletedImages: z.array(z.string()).optional(),
// });

// const formSchema = z.object({
//   name: z.string().min(2, { message: "Name must be at least 2 characters" }),
//   description: z.string().min(10, { message: "Description must be at least 10 characters" }),
//   slug: z.string().min(2, { message: "Slug must be at least 2 characters" }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
//     message: "Slug must contain only lowercase letters, numbers, and hyphens",
//   }),
//   price: z.coerce.number().positive({ message: "Price must be a positive number" }),
//   discountPrice: z.coerce.number().positive({ message: "Discount price must be a positive number" }).optional().nullable(),
//   stock: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer" }),
//   hsnCode: z.string().optional(),
//   categoryId: z.string({ required_error: "Please select a category" }),
//   keywords: z.array(z.string()).optional(),
//   variants: z.array(colorVariantSchema).optional(),
// });

// type FormValues = z.infer<typeof formSchema>;

// export default function EditProductPage() {
//   const params = useParams();
//   const router = useRouter();
//   const { toast } = useToast();
//   const dispatch = useAppDispatch();
//   const { selectedProduct, categories, status } = useAppSelector(state => state.adminProducts);
//   const [newImages, setNewImages] = useState<File[]>([]);
//   const [deletedImages, setDeletedImages] = useState<string[]>([]);
//   const [keyword, setKeyword] = useState("");
//   const [keywords, setKeywords] = useState<string[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [deletedVariants, setDeletedVariants] = useState<string[]>([]);
//   const isLoading = status === 'loading';
//   const productId = params.id as string;

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       slug: "",
//       price: 0,
//       discountPrice: null,
//       stock: 0,
//       hsnCode: "",
//       categoryId: "",
//       keywords: [],
//       variants: [],
//     },
//   });

//   const { fields, append, remove, update } = useFieldArray({
//     control: form.control,
//     name: "variants",
//   });

//   useEffect(() => {
//     dispatch(fetchProductById(productId));
//     dispatch(fetchCategories());

//     return () => {
//       dispatch(clearSelectedProduct());
//     };
//   }, [dispatch, productId]);

//   useEffect(() => {
//     if (selectedProduct) {
//       form.reset({
//         name: selectedProduct.name,
//         description: selectedProduct.description,
//         slug: selectedProduct.slug,
//         price: selectedProduct.price,
//         discountPrice: selectedProduct.discountPrice,
//         stock: selectedProduct.stock,
//         hsnCode: selectedProduct.hsnCode || "",
//         categoryId: selectedProduct.categoryId,
//         variants: selectedProduct.variants.map(variant => ({
//           id: variant.id,
//           color: variant.color,
//           colorCode: variant.colorCode,
//           size: variant.size || "",
//           stock: variant.stock,
//           images: variant.images || [],
//           newImages: [],
//           deletedImages: [],
//         })),
//       });

//       setKeywords(selectedProduct.keywords || []);
//     }
//   }, [selectedProduct, form]);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     accept: {
//       "image/*": [".jpeg", ".jpg", ".png", ".webp"],
//     },
//     onDrop: (acceptedFiles) => {
//       setNewImages((prev) => [...prev, ...acceptedFiles]);
//     },
//   });

//   const addKeyword = () => {
//     if (keyword.trim() && !keywords.includes(keyword.trim())) {
//       setKeywords((prev) => [...prev, keyword.trim()]);
//       setKeyword("");
//     }
//   };

//   const removeKeyword = (keywordToRemove: string) => {
//     setKeywords((prev) => prev.filter((k) => k !== keywordToRemove));
//   };

//   const removeNewImage = (index: number) => {
//     setNewImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   const removeExistingImage = (imageId: string) => {
//     setDeletedImages((prev) => [...prev, imageId]);
//   };

//   const handleDeleteVariant = (index: number) => {
//     const variant = form.getValues().variants?.[index];
//     if (variant?.id) {
//       setDeletedVariants(prev => [...prev, variant.id as string]);
//     }
//     remove(index);
//   };

//   const onSubmit = async (data: FormValues) => {
//     setIsSubmitting(true);

//     try {
//       // Create FormData for API call
//       const formData = new FormData();

//       // Add basic product data
//       formData.append("name", data.name);
//       formData.append("description", data.description);
//       formData.append("slug", data.slug);
//       formData.append("price", data.price.toString());
//       if (data.discountPrice) {
//         formData.append("discountPrice", data.discountPrice.toString());
//       }
//       formData.append("stock", data.stock.toString());
//       if (data.hsnCode) {
//         formData.append("hsnCode", data.hsnCode);
//       }
//       formData.append("categoryId", data.categoryId);

//       // Add keywords
//       formData.append("keywords", JSON.stringify(keywords));

//       // Add deleted images
//       if (deletedImages.length > 0) {
//         formData.append("deletedImages", JSON.stringify(deletedImages));
//       }

//       // Add new images
//       newImages.forEach(image => {
//         formData.append("newImages", image);
//       });

//       // Add variants
//       if (data.variants && data.variants.length > 0) {
//         // Clean up variant data for JSON
//         const cleanVariants = data.variants.map(variant => ({
//           id: variant.id,
//           color: variant.color,
//           colorCode: variant.colorCode,
//           size: variant.size || "",
//           stock: variant.stock
//         }));

//         formData.append("variants", JSON.stringify(cleanVariants));

//         // Add variant images
//         data.variants.forEach((variant, variantIndex) => {
//           // Add new variant images
//           if (variant.newImages && variant.newImages.length > 0) {
//             variant.newImages.forEach(image => {
//               formData.append(`variantNewImages_${variantIndex}`, image);
//             });
//           }

//           // Add deleted variant images
//           if (variant.deletedImages && variant.deletedImages.length > 0) {
//             formData.append(`variantDeletedImages_${variantIndex}`, JSON.stringify(variant.deletedImages));
//           }
//         });
//       }

//       // Add deleted variants
//       if (deletedVariants.length > 0) {
//         formData.append("deletedVariants", JSON.stringify(deletedVariants));
//       }

//       await dispatch(updateProduct({ id: productId, formData })).unwrap();

//       toast({
//         title: "Product updated",
//         description: "The product has been updated successfully.",
//       });

//       router.push("/admin/products");
//     } catch (error: any) {
//       console.error("Error updating product:", error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update product. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (isLoading && !selectedProduct) {
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
//         <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
//       </div>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//           <Card>
//             <CardHeader>
//               <CardTitle>Product Information</CardTitle>
//               <CardDescription>
//                 Update the basic information about the product.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Product Name</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter product name" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="categoryId"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Category</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         value={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select a category" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {categories.map((category) => (
//                             <SelectItem key={category.id} value={category.id}>
//                               {category.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <FormField
//                 control={form.control}
//                 name="slug"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Slug</FormLabel>
//                     <FormControl>
//                       <Input placeholder="product-slug" {...field} />
//                     </FormControl>
//                     <FormDescription>
//                       The slug is used in the URL and must be unique
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Enter product description"
//                         className="min-h-32"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <FormField
//                   control={form.control}
//                   name="price"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Price ($)</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           placeholder="0.00"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="discountPrice"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Discount Price ($)</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           placeholder="0.00"
//                           value={field.value === null ? "" : field.value}
//                           onChange={(e) => {
//                             const value = e.target.value;
//                             field.onChange(value === "" ? null : parseFloat(value));
//                           }}
//                         />
//                       </FormControl>
//                       <FormDescription>
//                         Leave empty if no discount
//                       </FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="stock"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Stock</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           min="0"
//                           step="1"
//                           placeholder="0"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <FormField
//                 control={form.control}
//                 name="hsnCode"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>HSN Code</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Enter HSN code" {...field} />
//                     </FormControl>
//                     <FormDescription>
//                       Harmonized System Nomenclature code for tax purposes
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Color Variants</CardTitle>
//               <CardDescription>
//                 Manage different color variants of this product
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {fields.map((field, index) => (
//                 <div key={field.id} className="border rounded-lg p-4 space-y-4">
//                   <div className="flex justify-between items-center">
//                     <h3 className="font-medium">Variant {index + 1}</h3>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleDeleteVariant(index)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <Trash className="h-4 w-4 mr-1" />
//                       Remove
//                     </Button>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <FormField
//                       control={form.control}
//                       name={`variants.${index}.color`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Color Name</FormLabel>
//                           <FormControl>
//                             <Input placeholder="e.g. Red, Blue, Green" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name={`variants.${index}.colorCode`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Color Code</FormLabel>
//                           <FormControl>
//                             <div className="flex items-center space-x-2">
//                               <Input type="color" {...field} className="w-12 h-10 p-1" />
//                               <Input
//                                 placeholder="#000000"
//                                 value={field.value}
//                                 onChange={field.onChange}
//                                 className="flex-1"
//                               />
//                             </div>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name={`variants.${index}.stock`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Stock</FormLabel>
//                           <FormControl>
//                             <Input
//                               type="number"
//                               min="0"
//                               step="1"
//                               placeholder="0"
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>

//                   <FormField
//                     control={form.control}
//                     name={`variants.${index}.size`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Size (Optional)</FormLabel>
//                         <FormControl>
//                           <Input placeholder="e.g. S, M, L, XL" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   {/* Existing variant images */}
//                   {field.images && field.images.length > 0 && (
//                     <div>
//                       <FormLabel>Current Images</FormLabel>
//                       <div className="grid grid-cols-3 gap-2 mt-2">
//                         {field.images.map((image: any, imageIndex: number) => (
//                           <div key={imageIndex} className="relative group aspect-square rounded-md overflow-hidden border">
//                             <img
//                               src={`/api/admin/products/${productId}/image/${image.id}`}
//                               alt={`Variant image ${imageIndex + 1}`}
//                               className="h-full w-full object-cover"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 const currentVariant = form.getValues().variants?.[index];
//                                 if (currentVariant) {
//                                   const deletedImages = currentVariant.deletedImages || [];
//                                   update(index, {
//                                     ...currentVariant,
//                                     deletedImages: [...deletedImages, image.id],
//                                   });
//                                 }
//                               }}
//                               className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                             >
//                               <X className="h-3 w-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* New variant images */}
//                   <FormField
//                     control={form.control}
//                     name={`variants.${index}.newImages`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Add New Images</FormLabel>
//                         <FormControl>
//                           <div
//                             className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-primary/50`}
//                           >
//                             <input
//                               type="file"
//                               multiple
//                               accept="image/*"
//                               onChange={(e) => {
//                                 const files = Array.from(e.target.files || []);
//                                 field.onChange(files);
//                               }}
//                               className="hidden"
//                               id={`variant-images-${index}`}
//                             />
//                             <label htmlFor={`variant-images-${index}`} className="cursor-pointer">
//                               <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
//                               <p className="text-sm text-muted-foreground">
//                                 Click to upload new variant images
//                               </p>
//                             </label>
//                           </div>
//                         </FormControl>
//                         <FormMessage />

//                         {field.value && field.value.length > 0 && (
//                           <div className="grid grid-cols-3 gap-2 mt-2">
//                             {Array.from(field.value).map((file: any, fileIndex) => (
//                               <div key={fileIndex} className="relative group aspect-square rounded-md overflow-hidden border">
//                                 <img
//                                   src={URL.createObjectURL(file)}
//                                   alt={`New variant image ${fileIndex + 1}`}
//                                   className="h-full w-full object-cover"
//                                 />
//                                 <button
//                                   type="button"
//                                   onClick={() => {
//                                     const newFiles = Array.from(field.value as File[]).filter((_, i) => i !== fileIndex);
//                                     field.onChange(newFiles);
//                                   }}
//                                   className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                                 >
//                                   <X className="h-3 w-3" />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               ))}

//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => append({ color: "", colorCode: "#000000", size: "", stock: 0, images: [], newImages: [], deletedImages: [] })}
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Another Variant
//               </Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Product Images</CardTitle>
//               <CardDescription>
//                 Manage the main product images.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Existing product images */}
//               {selectedProduct?.images && selectedProduct.images.length > 0 && (
//                 <div>
//                   <FormLabel>Current Images</FormLabel>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
//                     {selectedProduct.images
//                       .filter(image => !deletedImages.includes(image.id))
//                       .map((image) => (
//                         <div
//                           key={image.id}
//                           className="relative group aspect-square rounded-md overflow-hidden border"
//                         >
//                           <img
//                             src={`/api/admin/products/${productId}/image/${image.id}`}
//                             alt={`Product image`}
//                             className="h-full w-full object-cover"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => removeExistingImage(image.id)}
//                             className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                           >
//                             <X className="h-4 w-4" />
//                           </button>
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               )}

//               {/* Upload new images */}
//               <div>
//                 <FormLabel>Add New Images</FormLabel>
//                 <div
//                   {...getRootProps()}
//                   className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
//                     isDragActive
//                       ? "border-primary bg-primary/5"
//                       : "border-muted-foreground/25 hover:border-primary/50"
//                   }`}
//                 >
//                   <input {...getInputProps()} />
//                   <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
//                   <p className="text-sm text-muted-foreground mb-1">
//                     Drag & drop new product images here, or click to select files
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Supports: JPG, PNG, WEBP (Max 5MB each)
//                   </p>
//                 </div>

//                 {newImages.length > 0 && (
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
//                     {newImages.map((file, index) => (
//                       <div
//                         key={index}
//                         className="relative group aspect-square rounded-md overflow-hidden border"
//                       >
//                         <img
//                           src={URL.createObjectURL(file)}
//                           alt={`New product image ${index + 1}`}
//                           className="h-full w-full object-cover"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => removeNewImage(index)}
//                           className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                         >
//                           <X className="h-4 w-4" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>SEO & Metadata</CardTitle>
//               <CardDescription>
//                 Add keywords and metadata to improve product visibility.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <FormLabel>Keywords</FormLabel>
//                 <div className="flex flex-wrap gap-2 mb-2">
//                   {keywords.map((kw, index) => (
//                     <Badge key={index} variant="secondary" className="py-1.5">
//                       {kw}
//                       <button
//                         type="button"
//                         onClick={() => removeKeyword(kw)}
//                         className="ml-1 text-muted-foreground hover:text-foreground"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="flex gap-2">
//                   <Input
//                     placeholder="Add a keyword"
//                     value={keyword}
//                     onChange={(e) => setKeyword(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault();
//                         addKeyword();
//                       }
//                     }}
//                   />
//                   <Button type="button" onClick={addKeyword} size="sm">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add
//                   </Button>
//                 </div>
//                 <FormDescription>
//                   Press Enter or click Add to add a keyword
//                 </FormDescription>
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex justify-end gap-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => router.back()}
//               disabled={isSubmitting}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isSubmitting || isLoading}>
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Updating...
//                 </>
//               ) : (
//                 "Update Product"
//               )}
//             </Button>
//           </div>
//         </form>
//       </Form>
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
import { downloadInvoice, printInvoice } from "@/lib/utils/invoice";

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
    if (!selectedOrder) return;

    try {
      printInvoice(selectedOrder);
      toast({
        title: "Printing invoice",
        description: "The invoice has been sent to your printer.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to print invoice",
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = () => {
    if (!selectedOrder) return;

    try {
      downloadInvoice(selectedOrder);
      toast({
        title: "Invoice downloaded",
        description: "The invoice has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = orderStatusMap[status]?.icon || Package;
    return <StatusIcon className="h-5 w-5 mr-2" />;
  };

  if (isLoading || !selectedOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
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
                    {selectedOrder.orderItems.map((item) => (
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
                                href={`/admin/products/${item.productId}`}
                                className="font-medium hover:underline"
                              >
                                {item.product.name}
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

          <Card className="mt-6">
            <CardHeader>
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

          <Card className="mt-6">
            <CardHeader>
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
            <CardHeader>
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
            <CardHeader>
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
            <CardHeader>
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
