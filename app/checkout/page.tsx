// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import Link from "next/link";
// import { useSelector, useDispatch } from "react-redux";
// import { clearCart } from "@/lib/redux/features/cartSlice";
// import { RootState } from "@/lib/redux/store";
// import axios from "axios";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import {
//   ShoppingCart,
//   Package,
//   MapPin,
//   CreditCard,
//   ArrowLeft,
//   CheckCircle,
//   AlertCircle
// } from "lucide-react";
// import { useScript } from "@/hooks/use-script";

// export default function CheckoutPage() {
//   const { status } = useSession();
//   const router = useRouter();
//   const { toast } = useToast();
//   const dispatch = useDispatch();
//   const { items, totalAmount } = useSelector((state: RootState) => state.cart);
//   const [addresses, setAddresses] = useState<any[]>([]);
//   const [selectedAddressId, setSelectedAddressId] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [orderId, setOrderId] = useState<string | null>(null);
//   const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);

//   // Load Razorpay script
//   const razorpayStatus = useScript("https://checkout.razorpay.com/v1/checkout.js");

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/auth/signin");
//     } else if (status === "authenticated") {
//       fetchAddresses();
//     }

//     if (items.length === 0 && !paymentSuccess) {
//       router.push("/cart");
//     }
//   }, [status, router, items.length, paymentSuccess]);

//   const fetchAddresses = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get("/api/user/addresses");
//       setAddresses(response.data);

//       // Set default address if available
//       const defaultAddress = response.data.find((addr: any) => addr.isDefault);
//       if (defaultAddress) {
//         setSelectedAddressId(defaultAddress.id);
//       } else if (response.data.length > 0) {
//         setSelectedAddressId(response.data[0].id);
//       }
//     } catch (error) {
//       console.error("Error fetching addresses:", error);
//       toast({
//         title: "Error",
//         description: "Failed to load addresses",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCheckout = async () => {
//     if (!selectedAddressId) {
//       toast({
//         title: "No address selected",
//         description: "Please select a shipping address",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       setIsProcessing(true);

//       // Create order
//       const response = await axios.post("/api/checkout", {
//         items: items.map(item => ({
//           id: item.id,
//           quantity: item.quantity
//         })),
//         addressId: selectedAddressId
//       });

//       const { razorpayOrderId, amount, keyId } = response.data;

//       // Store order ID for verification
//       setOrderId(response.data.orderId);

//       // Initialize Razorpay
//       if (razorpayStatus === "ready") {
//         const options = {
//           key: keyId,
//           amount: amount * 100, // Amount in paise
//           currency: "INR",
//           name: "E-Commerce Store",
//           description: "Purchase from E-Commerce Store",
//           order_id: razorpayOrderId,
//           handler: function(response: any) {
//             verifyPayment(
//               response.razorpay_order_id,
//               response.razorpay_payment_id,
//               response.razorpay_signature
//             );
//           },
//           prefill: {
//             name: "Customer",
//             email: "customer@example.com",
//             contact: "9999999999"
//           },
//           theme: {
//             color: "#3399cc"
//           },
//           modal: {
//             ondismiss: function() {
//               setIsProcessing(false);
//               toast({
//                 title: "Payment cancelled",
//                 description: "You have cancelled the payment process",
//                 variant: "destructive",
//               });
//             }
//           }
//         };

//         const razorpayInstance = new (window as any).Razorpay(options);
//         razorpayInstance.open();
//       } else {
//         throw new Error("Razorpay failed to load");
//       }
//     } catch (error: any) {
//       console.error("Checkout error:", error);
//       toast({
//         title: "Checkout failed",
//         description: error.response?.data?.message || "Something went wrong during checkout",
//         variant: "destructive",
//       });
//       setIsProcessing(false);
//     }
//   };

//   const verifyPayment = async (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) => {
//     try {
//       const response = await axios.post("/api/checkout/verify", {
//         razorpayOrderId,
//         razorpayPaymentId,
//         razorpaySignature
//       });

//       // Payment successful
//       setInvoiceNumber(response.data.invoiceNumber);
//       setPaymentSuccess(true);
//       dispatch(clearCart());

//       toast({
//         title: "Payment successful",
//         description: "Your order has been placed successfully",
//       });
//     } catch (error: any) {
//       console.error("Payment verification error:", error);
//       toast({
//         title: "Payment verification failed",
//         description: error.response?.data?.message || "Failed to verify payment",
//         variant: "destructive",
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (status === "loading" || isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (paymentSuccess) {
//     return (
//       <div className="container mx-auto py-10 px-4">
//         <Card className="max-w-2xl mx-auto">
//           <CardContent className="flex flex-col items-center justify-center py-10">
//             <div className="bg-green-100 p-3 rounded-full mb-4">
//               <CheckCircle className="h-12 w-12 text-green-600" />
//             </div>
//             <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
//             <p className="text-center text-muted-foreground mb-6">
//               Thank you for your purchase. Your order has been placed successfully.
//             </p>
//             {invoiceNumber && (
//               <p className="text-center mb-6">
//                 Invoice Number: <span className="font-medium">{invoiceNumber}</span>
//               </p>
//             )}
//             <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
//               <Button asChild className="flex-1">
//                 <Link href={`/profile/orders/${orderId}`}>
//                   View Order
//                 </Link>
//               </Button>
//               <Button asChild variant="outline" className="flex-1">
//                 <Link href="/">
//                   Continue Shopping
//                 </Link>
//               </Button>
//             </div>
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
//           Back to Cart
//         </Button>
//         <h1 className="text-2xl font-bold">Checkout</h1>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="md:col-span-2 space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <MapPin className="h-5 w-5 mr-2" />
//                 Shipping Address
//               </CardTitle>
//               <CardDescription>
//                 Select the address where you want your order delivered
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {addresses.length === 0 ? (
//                 <div className="text-center py-6">
//                   <p className="text-muted-foreground mb-4">You don't have any saved addresses</p>
//                   <Button asChild>
//                     <Link href="/profile/addresses">
//                       Add New Address
//                     </Link>
//                   </Button>
//                 </div>
//               ) : (
//                 <RadioGroup
//                   value={selectedAddressId}
//                   onValueChange={setSelectedAddressId}
//                   className="space-y-4"
//                 >
//                   {addresses.map((address) => (
//                     <div
//                       key={address.id}
//                       className={`flex items-start space-x-3 border rounded-lg p-4 ${
//                         selectedAddressId === address.id ? "border-primary" : ""
//                       }`}
//                     >
//                       <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
//                       <Label htmlFor={address.id} className="flex-1 cursor-pointer">
//                         <div className="font-medium">{address.name}</div>
//                         <div className="text-sm text-muted-foreground">
//                           {address.street}, {address.city}, {address.state} {address.postalCode}, {address.country}
//                         </div>
//                         <div className="text-sm text-muted-foreground mt-1">
//                           Phone: {address.phone}
//                         </div>
//                         {address.isDefault && (
//                           <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
//                             Default Address
//                           </span>
//                         )}
//                       </Label>
//                     </div>
//                   ))}
//                 </RadioGroup>
//               )}
//             </CardContent>
//             <CardFooter>
//               <Button asChild variant="outline">
//                 <Link href="/profile/addresses">
//                   Manage Addresses
//                 </Link>
//               </Button>
//             </CardFooter>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <ShoppingCart className="h-5 w-5 mr-2" />
//                 Order Items
//               </CardTitle>
//               <CardDescription>
//                 Review your order items
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {items.map((item) => (
//                   <div key={item.id} className="flex items-center py-2">
//                     <div className="flex-shrink-0 mr-4">
//                       {item.image ? (
//                         <div className="h-16 w-16 rounded bg-muted overflow-hidden">
//                           <img
//                             src={item.image}
//                             alt={item.name}
//                             className="h-full w-full object-cover"
//                           />
//                         </div>
//                       ) : (
//                         <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
//                           <Package className="h-6 w-6 text-muted-foreground" />
//                         </div>
//                       )}
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="font-medium">{item.name}</h3>
//                       <p className="text-sm text-muted-foreground">
//                         Qty: {item.quantity} × ${item.price.toFixed(2)}
//                       </p>
//                     </div>
//                     <div className="font-medium">
//                       ${(item.price * item.quantity).toFixed(2)}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <CreditCard className="h-5 w-5 mr-2" />
//                 Payment Method
//               </CardTitle>
//               <CardDescription>
//                 Secure payment via Razorpay
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="border rounded-lg p-4">
//                 <div className="flex items-center">
//                   <div className="h-10 w-10 mr-3">
//                     <img
//                       src="https://razorpay.com/favicon.png"
//                       alt="Razorpay"
//                       className="h-full w-full object-contain"
//                     />
//                   </div>
//                   <div>
//                     <h3 className="font-medium">Razorpay</h3>
//                     <p className="text-sm text-muted-foreground">
//                       Pay securely using credit/debit card, UPI, or net banking
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-4 flex items-center text-sm text-muted-foreground">
//                 <AlertCircle className="h-4 w-4 mr-2" />
//                 <p>You will be redirected to Razorpay to complete your payment</p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div>
//           <Card className="sticky top-6">
//             <CardHeader>
//               <CardTitle>Order Summary</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Subtotal</span>
//                   <span>${totalAmount.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Shipping</span>
//                   <span>Free</span>
//                 </div>
//                 <Separator />
//                 <div className="flex justify-between font-bold">
//                   <span>Total</span>
//                   <span>${totalAmount.toFixed(2)}</span>
//                 </div>
//               </div>
//             </CardContent>
//             <CardFooter className="flex flex-col gap-4">
//               <Button
//                 className="w-full"
//                 onClick={handleCheckout}
//                 disabled={isProcessing || !selectedAddressId || addresses.length === 0}
//               >
//                 {isProcessing ? "Processing..." : "Place Order"}
//               </Button>
//               <p className="text-xs text-center text-muted-foreground">
//                 By placing your order, you agree to our Terms of Service and Privacy Policy
//               </p>
//             </CardFooter>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Package,
  MapPin,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Ticket,
  X,
  Loader2,
} from "lucide-react";
import { useScript } from "@/hooks/use-script";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  applyCoupon,
  removeCoupon,
  clearCart,
} from "@/lib/redux/features/cartSlice";

export default function CheckoutPage() {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { items, totalAmount, coupon } = useSelector(
    (state: RootState) => state.cart
  );
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Load Razorpay script
  const razorpayStatus = useScript(
    "https://checkout.razorpay.com/v1/checkout.js"
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchAddresses();
    }

    if (items.length === 0 && !paymentSuccess) {
      router.push("/cart");
    }
  }, [status, router, items.length, paymentSuccess]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/user/addresses");
      setAddresses(response.data);

      // Set default address if available
      const defaultAddress = response.data.find((addr: any) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (response.data.length > 0) {
        setSelectedAddressId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsApplyingCoupon(true);
      const response = await axios.post("/api/coupons/validate", {
        code: couponCode.trim().toUpperCase(),
        cartTotal: totalAmount,
      });

      const {
        valid,
        coupon: validatedCoupon,
        discount,
        message,
      } = response.data;

      if (valid) {
        dispatch(
          applyCoupon({
            id: validatedCoupon.id,
            code: validatedCoupon.code,
            discountPercentage: validatedCoupon.discountPercentage,
            maxDiscountAmount: validatedCoupon.maxDiscountAmount,
          })
        );

        toast({
          title: "Success",
          description: message,
        });

        setCouponCode("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to apply coupon",
        variant: "destructive",
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast({
      title: "Coupon removed",
      description: "The coupon has been removed from your order",
    });
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast({
        title: "No address selected",
        description: "Please select a shipping address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Create order
      const response = await axios.post("/api/checkout", {
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        addressId: selectedAddressId,
        couponId: coupon?.id,
      });

      const { razorpayOrderId, amount, keyId } = response.data;

      // Store order ID for verification
      setOrderId(response.data.orderId);

      // Initialize Razorpay
      if (razorpayStatus === "ready") {
        const options = {
          key: keyId,
          amount: amount * 100, // Amount in paise
          currency: "INR",
          name: "E-Commerce Store",
          description: "Purchase from E-Commerce Store",
          order_id: razorpayOrderId,
          handler: function (response: any) {
            verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
          prefill: {
            name: "Customer",
            email: "customer@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#3399cc",
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              toast({
                title: "Payment cancelled",
                description: "You have cancelled the payment process",
                variant: "destructive",
              });
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
      } else {
        throw new Error("Razorpay failed to load");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description:
          error.response?.data?.message ||
          "Something went wrong during checkout",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) => {
    try {
      const response = await axios.post("/api/checkout/verify", {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      // Payment successful
      setInvoiceNumber(response.data.invoiceNumber);
      setPaymentSuccess(true);
      dispatch(clearCart());

      toast({
        title: "Payment successful",
        description: "Your order has been placed successfully",
      });
    } catch (error: any) {
      console.error("Payment verification error:", error);
      toast({
        title: "Payment verification failed",
        description:
          error.response?.data?.message || "Failed to verify payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-center text-muted-foreground mb-6">
              Thank you for your purchase. Your order has been placed
              successfully.
            </p>
            {invoiceNumber && (
              <p className="text-center mb-6">
                Invoice Number:{" "}
                <span className="font-medium">{invoiceNumber}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
              <Button asChild className="flex-1">
                <Link href={`/profile/orders/${orderId}`}>View Order</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const finalAmount = coupon
    ? Math.max(0, totalAmount - coupon.discount)
    : totalAmount;

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
          Back to Cart
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </CardTitle>
              <CardDescription>
                Select the address where you want your order delivered
              </CardDescription>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    You don't have any saved addresses
                  </p>
                  <Button asChild>
                    <Link href="/profile/addresses">Add New Address</Link>
                  </Button>
                </div>
              ) : (
                <RadioGroup
                  value={selectedAddressId}
                  onValueChange={setSelectedAddressId}
                  className="space-y-4"
                >
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`flex items-start space-x-3 border rounded-lg p-4 ${
                        selectedAddressId === address.id ? "border-primary" : ""
                      }`}
                    >
                      <RadioGroupItem
                        value={address.id}
                        id={address.id}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={address.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{address.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {address.street}, {address.city}, {address.state}{" "}
                          {address.postalCode}, {address.country}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Phone: {address.phone}
                        </div>
                        {address.isDefault && (
                          <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Default Address
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href="/profile/addresses">Manage Addresses</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Items
              </CardTitle>
              <CardDescription>Review your order items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center py-2">
                    <div className="flex-shrink-0 mr-4">
                      {item.image ? (
                        <div className="h-16 w-16 rounded bg-muted overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Method
              </CardTitle>
              <CardDescription>Secure payment via Razorpay</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 mr-3">
                    <img
                      src="https://razorpay.com/favicon.png"
                      alt="Razorpay"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">Razorpay</h3>
                    <p className="text-sm text-muted-foreground">
                      Pay securely using credit/debit card, UPI, or net banking
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-2" />
                <p>
                  You will be redirected to Razorpay to complete your payment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>

                {/* Coupon Input */}
                {!coupon ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                    <div className="flex items-center">
                      <Ticket className="h-4 w-4 mr-2 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{coupon.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {coupon.discountPercentage}% off
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-600">
                        -${coupon.discount.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveCoupon}
                        className="h-6 w-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={
                  isProcessing || !selectedAddressId || addresses.length === 0
                }
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By placing your order, you agree to our Terms of Service and
                Privacy Policy
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import Link from "next/link";
// import axios from "axios";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
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
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { useToast } from "@/hooks/use-toast";
// import { useScript } from "@/hooks/use-script";
// import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
// import { clearCart, setPaymentMethod } from "@/lib/redux/features/cartSlice";
// import {
//   Package,
//   CreditCard,
//   Truck,
//   MapPin,
//   Plus,
//   ArrowRight,
//   Loader2,
//   AlertTriangle,
// } from "lucide-react";

// const couponFormSchema = z.object({
//   code: z.string().min(1, { message: "Please enter a coupon code" }),
// });

// type CouponFormValues = z.infer<typeof couponFormSchema>;

// export default function CheckoutPage() {
//   const { status } = useSession();
//   const router = useRouter();
//   const { toast } = useToast();
//   const dispatch = useAppDispatch();
//   const { items, totalAmount, totalQuantity, codCharges, paymentMethod, coupon } = useAppSelector(
//     (state) => state.cart
//   );
//   const [isLoading, setIsLoading] = useState(false);
//   const [addresses, setAddresses] = useState<any[]>([]);
//   const [selectedAddress, setSelectedAddress] = useState<string>("");
//   const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
//   const razorpayStatus = useScript("https://checkout.razorpay.com/v1/checkout.js");

//   const couponForm = useForm<CouponFormValues>({
//     resolver: zodResolver(couponFormSchema),
//     defaultValues: {
//       code: "",
//     },
//   });

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/auth/signin");
//     } else if (status === "authenticated") {
//       fetchAddresses();
//     }
//   }, [status, router]);

//   useEffect(() => {
//     if (addresses.length > 0) {
//       const defaultAddress = addresses.find((addr) => addr.isDefault);
//       if (defaultAddress) {
//         setSelectedAddress(defaultAddress.id);
//       } else {
//         setSelectedAddress(addresses[0].id);
//       }
//     }
//   }, [addresses]);

//   const fetchAddresses = async () => {
//     try {
//       const response = await axios.get("/api/user/addresses");
//       setAddresses(response.data);
//     } catch (error) {
//       console.error("Error fetching addresses:", error);
//       toast({
//         title: "Error",
//         description: "Failed to load addresses",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleCouponSubmit = async (data: CouponFormValues) => {
//     try {
//       setIsApplyingCoupon(true);
//       const response = await axios.post("/api/coupons/validate", {
//         code: data.code,
//         cartTotal: totalAmount,
//       });

//       dispatch({
//         type: "cart/applyCoupon",
//         payload: response.data.coupon,
//       });

//       toast({
//         title: "Coupon applied",
//         description: response.data.message,
//       });

//       couponForm.reset();
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to apply coupon",
//         variant: "destructive",
//       });
//     } finally {
//       setIsApplyingCoupon(false);
//     }
//   };

//   const handlePaymentMethodChange = (value: 'ONLINE' | 'COD') => {
//     dispatch(setPaymentMethod(value));
//   };

//   const handleCheckout = async () => {
//     if (!selectedAddress) {
//       toast({
//         title: "Error",
//         description: "Please select a delivery address",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!paymentMethod) {
//       toast({
//         title: "Error",
//         description: "Please select a payment method",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       setIsLoading(true);

//       // Create order
//       const orderData = {
//         items: items.map((item) => ({
//           id: item.id,
//           quantity: item.quantity,
//         })),
//         addressId: selectedAddress,
//         couponId: coupon?.id,
//         paymentMethod,
//       };

//       const response = await axios.post("/api/checkout", orderData);

//       if (paymentMethod === 'ONLINE') {
//         // Handle Razorpay payment
//         const options = {
//           key: response.data.keyId,
//           amount: response.data.amount * 100,
//           currency: response.data.currency,
//           name: "E-Commerce Store",
//           description: "Order Payment",
//           order_id: response.data.razorpayOrderId,
//           handler: async function (response: any) {
//             try {
//               await axios.post("/api/checkout/verify", {
//                 razorpayOrderId: response.razorpay_order_id,
//                 razorpayPaymentId: response.razorpay_payment_id,
//                 razorpaySignature: response.razorpay_signature,
//               });

//               dispatch(clearCart());
//               router.push(`/profile/orders/${response.data.orderId}`);

//               toast({
//                 title: "Payment successful",
//                 description: "Your order has been placed successfully.",
//               });
//             } catch (error) {
//               toast({
//                 title: "Error",
//                 description: "Payment verification failed",
//                 variant: "destructive",
//               });
//             }
//           },
//           prefill: {
//             email: addresses[0]?.email,
//             contact: addresses[0]?.phone,
//           },
//           theme: {
//             color: "#000000",
//           },
//         };

//         const razorpay = new (window as any).Razorpay(options);
//         razorpay.open();
//       } else {
//         // Handle COD order
//         dispatch(clearCart());
//         router.push(`/profile/orders/${response.data.orderId}`);

//         toast({
//           title: "Order placed",
//           description: "Your order has been placed successfully with Cash on Delivery.",
//         });
//       }
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to place order",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (status === "loading") {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (items.length === 0) {
//     return (
//       <div className="container mx-auto py-10 px-4">
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center h-64">
//             <Package className="h-12 w-12 text-muted-foreground mb-4" />
//             <p className="text-muted-foreground mb-4">Your cart is empty</p>
//             <Button asChild>
//               <Link href="/products">Continue Shopping</Link>
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const finalAmount = totalAmount - (coupon?.discount || 0) + codCharges;

//   return (
//     <div className="container mx-auto py-10 px-4">
//       <h1 className="text-3xl font-bold mb-6">Checkout</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">
//           {/* Delivery Address */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Delivery Address</CardTitle>
//               <CardDescription>Select where you want your order delivered</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {addresses.length === 0 ? (
//                 <div className="text-center py-6">
//                   <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                   <p className="text-muted-foreground mb-4">No addresses found</p>
//                   <Button asChild>
//                     <Link href="/profile/addresses">
//                       <Plus className="mr-2 h-4 w-4" />
//                       Add New Address
//                     </Link>
//                   </Button>
//                 </div>
//               ) : (
//                 <RadioGroup
//                   value={selectedAddress}
//                   onValueChange={setSelectedAddress}
//                   className="space-y-4"
//                 >
//                   {addresses.map((address) => (
//                     <div
//                       key={address.id}
//                       className={`flex items-start space-x-4 rounded-lg border p-4 ${
//                         selectedAddress === address.id ? "border-primary" : ""
//                       }`}
//                     >
//                       <RadioGroupItem value={address.id} id={address.id} />
//                       <div className="flex-1">
//                         <label
//                           htmlFor={address.id}
//                           className="flex items-center cursor-pointer"
//                         >
//                           <div>
//                             <p className="font-medium">{address.name}</p>
//                             <p className="text-sm text-muted-foreground">
//                               {address.street}
//                             </p>
//                             <p className="text-sm text-muted-foreground">
//                               {address.city}, {address.state} {address.postalCode}
//                             </p>
//                             <p className="text-sm text-muted-foreground">
//                               {address.country}
//                             </p>
//                             <p className="text-sm mt-1">Phone: {address.phone}</p>
//                           </div>
//                           {address.isDefault && (
//                             <Badge className="ml-2">Default</Badge>
//                           )}
//                         </label>
//                       </div>
//                     </div>
//                   ))}
//                 </RadioGroup>
//               )}
//               <div className="mt-4">
//                 <Button asChild variant="outline">
//                   <Link href="/profile/addresses">
//                     <Plus className="mr-2 h-4 w-4" />
//                     Add New Address
//                   </Link>
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Payment Method */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Payment Method</CardTitle>
//               <CardDescription>Choose how you want to pay</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <RadioGroup
//                 value={paymentMethod || ""}
//                 onValueChange={(value: 'ONLINE' | 'COD') => handlePaymentMethodChange(value)}
//                 className="space-y-4"
//               >
//                 <div className="flex items-center space-x-4 rounded-lg border p-4">
//                   <RadioGroupItem value="ONLINE" id="online" />
//                   <label htmlFor="online" className="flex items-center cursor-pointer flex-1">
//                     <div className="h-10 w-10 mr-3">
//                       <img
//                         src="https://razorpay.com/favicon.png"
//                         alt="Razorpay"
//                         className="h-full w-full object-contain"
//                       />
//                     </div>
//                     <div>
//                       <p className="font-medium">Online Payment</p>
//                       <p className="text-sm text-muted-foreground">
//                         Pay securely using credit/debit card, UPI, or net banking
//                       </p>
//                     </div>
//                   </label>
//                 </div>

//                 <div className="flex items-center space-x-4 rounded-lg border p-4">
//                   <RadioGroupItem value="COD" id="cod" />
//                   <label htmlFor="cod" className="flex items-center cursor-pointer flex-1">
//                     <div className="h-10 w-10 mr-3 bg-primary/10 rounded-full flex items-center justify-center">
//                       <CreditCard className="h-6 w-6 text-primary" />
//                     </div>
//                     <div>
//                       <p className="font-medium">Cash on Delivery</p>
//                       <p className="text-sm text-muted-foreground">
//                         Pay with cash when your order arrives
//                       </p>
//                       {codCharges > 0 && (
//                         <p className="text-sm text-red-600 mt-1">
//                           Additional COD charges: ${codCharges.toFixed(2)}
//                         </p>
//                       )}
//                     </div>
//                   </label>
//                 </div>
//               </RadioGroup>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Order Summary</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {items.map((item) => (
//                   <div key={item.id} className="flex justify-between">
//                     <div className="flex items-center">
//                       <div className="h-10 w-10 rounded bg-muted mr-3">
//                         {item.image ? (
//                           <img
//                             src={item.image}
//                             alt={item.name}
//                             className="h-full w-full object-cover rounded"
//                           />
//                         ) : (
//                           <div className="h-full w-full flex items-center justify-center">
//                             <Package className="h-5 w-5 text-muted-foreground" />
//                           </div>
//                         )}
//                       </div>
//                       <div>
//                         <p className="font-medium">{item.name}</p>
//                         <p className="text-sm text-muted-foreground">
//                           Qty: {item.quantity}
//                         </p>
//                       </div>
//                     </div>
//                     <p className="font-medium">
//                       ${(item.price * item.quantity).toFixed(2)}
//                     </p>
//                   </div>
//                 ))}

//                 <Separator />

//                 <Form {...couponForm}>
//                   <form
//                     onSubmit={couponForm.handleSubmit(handleCouponSubmit)}
//                     className="space-y-2"
//                   >
//                     <FormField
//                       control={couponForm.control}
//                       name="code"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Have a coupon code?</FormLabel>
//                           <div className="flex space-x-2">
//                             <FormControl>
//                               <Input
//                                 placeholder="Enter code"
//                                 {...field}
//                                 disabled={isApplyingCoupon || !!coupon}
//                               />
//                             </FormControl>
//                             {coupon ? (
//                               <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={() => dispatch({ type: "cart/removeCoupon" })}
//                               >
//                                 Remove
//                               </Button>
//                             ) : (
//                               <Button
//                                 type="submit"
//                                 disabled={isApplyingCoupon}
//                               >
//                                 Apply
//                               </Button>
//                             )}
//                           </div>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </form>
//                 </Form>

//                 {coupon && (
//                   <div className="bg-primary/5 p-3 rounded-lg">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="font-medium">{coupon.code}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {coupon.discountPercentage}% off
//                           {coupon.maxDiscountAmount
//                             ? ` up to $${coupon.maxDiscountAmount}`
//                             : ""}
//                         </p>
//                       </div>
//                       <p className="text-green-600">-${coupon.discount.toFixed(2)}</p>
//                     </div>
//                   </div>
//                 )}

//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Subtotal</span>
//                     <span>${totalAmount.toFixed(2)}</span>
//                   </div>
//                   {coupon && (
//                     <div className="flex justify-between text-green-600">
//                       <span>Discount</span>
//                       <span>-${coupon.discount.toFixed(2)}</span>
//                     </div>
//                   )}
//                   {codCharges > 0 && (
//                     <div className="flex justify-between text-red-600">
//                       <span>COD Charges</span>
//                       <span>+${codCharges.toFixed(2)}</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Shipping</span>
//                     <span>Free</span>
//                   </div>
//                   <Separator />
//                   <div className="flex justify-between font-bold">
//                     <span>Total</span>
//                     <span>${finalAmount.toFixed(2)}</span>
//                   </div>
//                 </div>

//                 <Button
//                   className="w-full"
//                   size="lg"
//                   onClick={handleCheckout}
//                   disabled={
//                     isLoading ||
//                     !selectedAddress ||
//                     !paymentMethod ||
//                     razorpayStatus === "error"
//                   }
//                 >
//                   {isLoading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       Place Order
//                       <ArrowRight className="ml-2 h-4 w-4" />
//                     </>
//                   )}
//                 </Button>

//                 {razorpayStatus === "error" && (
//                   <div className="flex items-center text-red-600 text-sm mt-2">
//                     <AlertTriangle className="h-4 w-4 mr-1" />
//                     Payment system is currently unavailable
//                   </div>
//                 )}

//                 <div className="text-sm text-muted-foreground text-center space-y-1">
//                   <p className="flex items-center justify-center">
//                     <Truck className="h-4 w-4 mr-1" />
//                     Free shipping on all orders
//                   </p>
//                   <p>100% secure checkout</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
