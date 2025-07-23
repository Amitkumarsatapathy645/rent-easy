"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Home, User, LogOut, Plus, Search, Heart, Loader2 } from "lucide-react";

export default function Header() {
  const { data: session, status } = useSession();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  useEffect(() => {
    if (session) {
      fetch("/api/bookmarks/user")
        .then((res) => res.json())
        .then((data) => setBookmarkCount(data.length))
        .catch((err) => console.error("Error fetching bookmark count:", err));
    }
  }, [session]);
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">RentEasy</span>
          </Link>

          {status === "loading" ? (
            <div className="flex items-center space-x-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          ) : (
            <>
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/properties"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Properties
                </Link>
                <Link
                  href="/requirements"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Requirements
                </Link>
                {session?.user.role === "owner" && (
                  <Link
                    href="/dashboard/owner"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Owner Dashboard
                  </Link>
                )}
                {session?.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </nav>

              <div className="flex items-center space-x-4">
                {session ? (
                  <>
                    <Link href="/bookmarks" className="relative">
                      <Button variant="ghost" size="icon">
                        <Heart className="h-5 w-5" />
                        {bookmarkCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {bookmarkCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                    {session.user.role === "owner" && (
                      <Link href="/properties/new">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          List Property
                        </Button>
                      </Link>
                    )}
                    {session.user.role === "tenant" && (
                      <Link href="/requirements/new">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Post Requirement
                        </Button>
                      </Link>
                    )}
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {session.user.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => signOut({ callbackUrl: "/" })}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/signin">
                      <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button>Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
