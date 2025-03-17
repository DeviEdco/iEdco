"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Mail, 
  CreditCard, 
  AlertTriangle,
  Save,
  Loader2
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { 
  fetchSettings, 
  updatePaymentSettings, 
  updateEmailSettings, 
  testEmailSettings, 
  updateMaintenanceMode 
} from "@/lib/redux/features/admin/settingsSlice";

const paymentFormSchema = z.object({
  razorpayKeyId: z.string().min(1, { message: "Razorpay Key ID is required" }),
  razorpayKeySecret: z.string().min(1, { message: "Razorpay Key Secret is required" }),
});

const emailFormSchema = z.object({
  smtpHost: z.string().min(1, { message: "SMTP Host is required" }),
  smtpPort: z.coerce.number().int().positive({ message: "SMTP Port must be a positive integer" }),
  smtpUser: z.string().email({ message: "Please enter a valid email" }),
  smtpPass: z.string().min(1, { message: "SMTP Password is required" }),
});

const maintenanceFormSchema = z.object({
  maintenanceMode: z.boolean().default(false),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;
type EmailFormValues = z.infer<typeof emailFormSchema>;
type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { data: settings, status } = useAppSelector(state => state.adminSettings);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const isLoading = status === 'loading';

  // Initialize forms with settings data
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      razorpayKeyId: settings?.razorpayKeyId || "",
      razorpayKeySecret: settings?.razorpayKeySecret || "",
    },
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      smtpHost: settings?.smtpHost || "",
      smtpPort: settings?.smtpPort || 587,
      smtpUser: settings?.smtpUser || "",
      smtpPass: settings?.smtpPass || "",
    },
  });

  const maintenanceForm = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      maintenanceMode: settings?.maintenanceMode || false,
    },
  });

  // Fetch settings on component mount
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      paymentForm.reset({
        razorpayKeyId: settings.razorpayKeyId || "",
        razorpayKeySecret: settings.razorpayKeySecret || "",
      });
      
      emailForm.reset({
        smtpHost: settings.smtpHost || "",
        smtpPort: settings.smtpPort || 587,
        smtpUser: settings.smtpUser || "",
        smtpPass: settings.smtpPass || "",
      });
      
      maintenanceForm.reset({
        maintenanceMode: settings.maintenanceMode || false,
      });
    }
  }, [settings, paymentForm, emailForm, maintenanceForm]);

  const onPaymentSubmit = async (data: PaymentFormValues) => {
    try {
      await dispatch(updatePaymentSettings(data)).unwrap();
      
      toast({
        title: "Payment settings updated",
        description: "Your payment gateway settings have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment settings",
        variant: "destructive",
      });
    }
  };

  const onEmailSubmit = async (data: EmailFormValues) => {
    try {
      await dispatch(updateEmailSettings(data)).unwrap();
      
      toast({
        title: "Email settings updated",
        description: "Your SMTP settings have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email settings",
        variant: "destructive",
      });
    }
  };

  const onMaintenanceSubmit = async (data: MaintenanceFormValues) => {
    try {
      await dispatch(updateMaintenanceMode(data.maintenanceMode)).unwrap();
      
      toast({
        title: "Maintenance settings updated",
        description: `Maintenance mode is now ${data.maintenanceMode ? "enabled" : "disabled"}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update maintenance settings",
        variant: "destructive",
      });
    }
  };

  const testEmailConnection = async () => {
    setIsTestingEmail(true);
    try {
      const data = emailForm.getValues();
      await dispatch(testEmailSettings(data)).unwrap();
      
      toast({
        title: "Test email sent",
        description: "A test email has been sent successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Gateway
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email Configuration
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Maintenance Mode
          </TabsTrigger>
        </TabsList>

        {/* Payment Gateway Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Razorpay Configuration</CardTitle>
              <CardDescription>
                Configure your Razorpay payment gateway settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...paymentForm}>
                <form
                  onSubmit={paymentForm.handleSubmit(onPaymentSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={paymentForm.control}
                    name="razorpayKeyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razorpay Key ID</FormLabel>
                        <FormControl>
                          <Input placeholder="rzp_test_..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter your Razorpay Key ID from your dashboard.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentForm.control}
                    name="razorpayKeySecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razorpay Key Secret</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="rzp_secret_..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter your Razorpay Key Secret from your dashboard.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Configuration */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>
                Configure your SMTP settings for sending transactional emails.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={emailForm.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input placeholder="smtp.example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="587"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={emailForm.control}
                      name="smtpUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="noreply@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="smtpPass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={testEmailConnection}
                      disabled={isLoading || isTestingEmail}
                    >
                      {isTestingEmail ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      Test Connection
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Mode */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                Enable maintenance mode to temporarily disable the store frontend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...maintenanceForm}>
                <form
                  onSubmit={maintenanceForm.handleSubmit(onMaintenanceSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={maintenanceForm.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Maintenance Mode
                          </FormLabel>
                          <FormDescription>
                            When enabled, the store will display a maintenance message to all visitors.
                            Admin users will still be able to access the admin panel.
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
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}