"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, PackageOpen } from "lucide-react";

const returnFormSchema = z.object({
  reason: z.string().min(1, "Please select a return reason"),
  description: z
    .string()
    .min(10, "Please provide more details about the return"),
});

type ReturnFormValues = z.infer<typeof returnFormSchema>;

const RETURN_REASONS = [
  "Damaged product",
  "Wrong item received",
  "Size/fit issue",
  "Quality not as expected",
  "Product defective",
  "Other",
];

export default function ReturnRequestPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      reason: "",
      description: "",
    },
  });

  const onSubmit = async (data: ReturnFormValues) => {
    try {
      setIsSubmitting(true);
      await axios.post(`/api/orders/${params.id}/return`, data);

      toast({
        title: "Return request submitted",
        description: "We'll review your request and get back to you soon.",
      });

      router.push(`/profile/orders/${params.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to submit return request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-2xl font-bold">Return Request</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit Return Request</CardTitle>
            <CardDescription>
              Please provide details about why you want to return this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Reason</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RETURN_REASONS.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide more details about your return request..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <PackageOpen className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">Return Policy</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>
                      • Returns must be initiated within 7 days of delivery
                    </li>
                    <li>• Item must be unused and in original packaging</li>
                    <li>• Refund will be processed after item inspection</li>
                    <li>• Shipping charges for returns may apply</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Return Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
