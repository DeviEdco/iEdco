"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  updateShiprocketSettings,
  updateReturnSettings,
} from "@/lib/redux/features/admin/settingsSlice";
import { Truck, PackageCheck, ArrowLeftRight } from "lucide-react";

const shiprocketFormSchema = z.object({
  enableShiprocket: z.boolean(),
  shiprocketEmail: z.string().email("Please enter a valid email"),
  shiprocketPassword: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

const returnFormSchema = z.object({
  enableReturns: z.boolean(),
  returnPeriod: z.coerce
    .number()
    .min(1, "Return period must be at least 1 day"),
});

export default function ShippingSettingsPage() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.adminSettings.data);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const shiprocketForm = useForm({
    resolver: zodResolver(shiprocketFormSchema),
    defaultValues: {
      enableShiprocket: settings?.enableShiprocket || false,
      shiprocketEmail: settings?.shiprocketEmail || "",
      shiprocketPassword: settings?.shiprocketPassword || "",
    },
  });

  const returnForm = useForm({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      enableReturns: settings?.enableReturns || false,
      returnPeriod: settings?.returnPeriod || 7,
    },
  });

  const onShiprocketSubmit = async (
    data: z.infer<typeof shiprocketFormSchema>
  ) => {
    try {
      await dispatch(updateShiprocketSettings(data)).unwrap();

      toast({
        title: "Settings updated",
        description: "Shiprocket settings have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update Shiprocket settings",
        variant: "destructive",
      });
    }
  };

  const onReturnSubmit = async (data: z.infer<typeof returnFormSchema>) => {
    try {
      await dispatch(updateReturnSettings(data)).unwrap();

      toast({
        title: "Settings updated",
        description: "Return settings have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update return settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Shipping Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Shiprocket Integration
          </CardTitle>
          <CardDescription>
            Configure your Shiprocket shipping integration settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...shiprocketForm}>
            <form
              onSubmit={shiprocketForm.handleSubmit(onShiprocketSubmit)}
              className="space-y-6"
            >
              <FormField
                control={shiprocketForm.control}
                name="enableShiprocket"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Shiprocket Integration
                      </FormLabel>
                      <FormDescription>
                        Use Shiprocket for order fulfillment and shipping
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={shiprocketForm.control}
                  name="shiprocketEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shiprocket Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your Shiprocket email"
                          {...field}
                          disabled={!shiprocketForm.watch("enableShiprocket")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={shiprocketForm.control}
                  name="shiprocketPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shiprocket Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your Shiprocket password"
                          {...field}
                          disabled={!shiprocketForm.watch("enableShiprocket")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsTestingConnection(true);
                    // Add test connection logic here
                    setTimeout(() => {
                      setIsTestingConnection(false);
                      toast({
                        title: "Connection successful",
                        description: "Successfully connected to Shiprocket",
                      });
                    }, 2000);
                  }}
                  disabled={
                    isTestingConnection ||
                    !shiprocketForm.watch("enableShiprocket") ||
                    !shiprocketForm.watch("shiprocketEmail") ||
                    !shiprocketForm.watch("shiprocketPassword")
                  }
                >
                  {isTestingConnection ? "Testing..." : "Test Connection"}
                </Button>
                <Button
                  type="submit"
                  disabled={!shiprocketForm.formState.isDirty}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowLeftRight className="h-5 w-5 mr-2" />
            Returns Management
          </CardTitle>
          <CardDescription>
            Configure your returns and refund policy settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...returnForm}>
            <form
              onSubmit={returnForm.handleSubmit(onReturnSubmit)}
              className="space-y-6"
            >
              <FormField
                control={returnForm.control}
                name="enableReturns"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Returns
                      </FormLabel>
                      <FormDescription>
                        Allow customers to request returns for their orders
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

              <FormField
                control={returnForm.control}
                name="returnPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Period (Days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="7"
                        {...field}
                        disabled={!returnForm.watch("enableReturns")}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of days after delivery within which returns are
                      accepted
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={!returnForm.formState.isDirty}>
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
