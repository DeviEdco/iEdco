import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LayoutDashboard, LogOut } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UserNavMenu from "@/components/user-nav-menu";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6" />
          <span className="text-xl font-bold">E-Commerce</span>
        </div>
        <nav className="flex items-center space-x-4">
          <Link href="/products" className="hover:text-primary">
            Products
          </Link>
          <Link href="/categories" className="hover:text-primary">
            Categories
          </Link>
          {!isLoggedIn ? (
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          ) : (
            <UserNavMenu user={session.user} />
          )}
          <Link href="/cart">
            <Button>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Cart
            </Button>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Shop the Latest Products
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover our curated collection of high-quality products at competitive prices.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/products">
              <Button size="lg">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Placeholder for featured categories */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-muted"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Category {i}</h3>
                  <p className="text-muted-foreground mb-4">
                    Explore our selection of products in this category.
                  </p>
                  <Button variant="outline" className="w-full">
                    View Products
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for featured products */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-muted"></div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">Product {i}</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Product description goes here.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">$99.99</span>
                    <Button size="sm">Add to Cart</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-muted py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">E-Commerce</h3>
              <p className="text-muted-foreground">
                Your one-stop shop for all your needs.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Shop</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/products" className="text-muted-foreground hover:text-foreground">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-muted-foreground hover:text-foreground">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/deals" className="text-muted-foreground hover:text-foreground">
                    Deals & Offers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Account</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/signin" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="text-muted-foreground hover:text-foreground">
                    Order History
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-muted-foreground">
                  Email: support@ecommerce.com
                </li>
                <li className="text-muted-foreground">
                  Phone: +1 (123) 456-7890
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} E-Commerce. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}