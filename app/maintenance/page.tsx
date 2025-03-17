import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Settings, AlertTriangle } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 p-3 rounded-full">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Site Under Maintenance</h1>
        <p className="text-muted-foreground mb-8">
          We're currently performing scheduled maintenance on our website. We'll be back online shortly. Thank you for your patience.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/auth/signin">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Admin Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}