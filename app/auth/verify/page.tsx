"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.post("/api/auth/verify", { token });
        setIsVerified(true);
      } catch (error: any) {
        setError(error.response?.data?.message || "Verification failed");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6" />
              <span className="text-xl font-bold">E-Commerce</span>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            Verifying your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p>Verifying your email...</p>
            </div>
          ) : isVerified ? (
            <div className="flex flex-col items-center space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h3 className="text-xl font-semibold">Email Verified Successfully</h3>
              <p className="text-muted-foreground">
                Your email has been verified. You can now access all features of your account.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 text-center">
              <XCircle className="h-16 w-16 text-destructive" />
              <h3 className="text-xl font-semibold">Verification Failed</h3>
              <p className="text-muted-foreground">
                {error || "We couldn't verify your email. The link may have expired or is invalid."}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/")}>
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}