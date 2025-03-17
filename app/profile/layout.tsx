import { ReactNode } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Star, 
  Home,
  LogOut
} from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";

export const metadata: Metadata = {
  title: "My Account | E-Commerce",
  description: "Manage your account, orders, addresses, and reviews",
};

interface ProfileLayoutProps {
  children: ReactNode;
}

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <User className="mr-3 h-5 w-5 text-muted-foreground" />
              My Account
            </Link>
            <Link
              href="/profile/orders"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <ShoppingBag className="mr-3 h-5 w-5 text-muted-foreground" />
              Orders
            </Link>
            <Link
              href="/profile/addresses"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
              Addresses
            </Link>
            <Link
              href="/profile/reviews"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <Star className="mr-3 h-5 w-5 text-muted-foreground" />
              Reviews
            </Link>
            <div className="pt-4 mt-4 border-t">
              <Link
                href="/"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
              >
                <Home className="mr-3 h-5 w-5 text-muted-foreground" />
                Back to Home
              </Link>
              <LogoutButton />
            </div>
          </nav>
        </aside>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}