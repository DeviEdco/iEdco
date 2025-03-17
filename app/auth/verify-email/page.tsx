"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Mail, AlertTriangle } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    // If email is already verified, redirect to home
    if (session?.user.emailVerified) {
      router.push("/");
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  // For Google OAuth users, automatically verify their email
  useEffect(() => {
    const autoVerifyGoogleUser = async () => {
      if (session?.user.id && !session.user.emailVerified) {
        // Check if user signed in with Google (no password)
        try {
          // Update the session to reflect the email verification
          await update();
          router.push("/");
        } catch (error) {
          console.error("Error verifying email:", error);
        }
      }
    };

    if (status === "authenticated") {
      autoVerifyGoogleUser();
    }
  }, [session, status, router, update]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            Please verify your email address to access all features
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="bg-yellow-100 p-3 rounded-full mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Email Verification Required</h3>
          <p className="text-center text-muted-foreground mb-6">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
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