"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="mr-3 h-5 w-5" />
      Log out
    </Button>
  );
}