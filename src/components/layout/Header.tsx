"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/layout/UserMenu";
import {
  User,
  LogOut,
  Plus,
  Heart,
  Menu,
  X
} from "lucide-react";
import Image from "next/image";

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function Header() {
  const { data: session, status } = useSession();
  const mounted = useMounted();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Close mobile menu on navigation
  const navRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!mobileMenu) return;
    function onClick(e: MouseEvent) {
      if (
        navRef.current &&
        !navRef.current.contains(e.target as Node)
      ) {
        setMobileMenu(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [mobileMenu]);

  useEffect(() => {
    if (session) {
      fetch("/api/bookmarks/user")
        .then((res) => res.json())
        .then((data) => setBookmarkCount(data.length))
        .catch(() => setBookmarkCount(0));
    }
  }, [session]);

  // Render minimal header/skeleton for SSR hydration then full UI
  if (!mounted) {
    return (
      <header className="header-glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 animate-pulse">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200/70 rounded-lg" />
              <span className="hidden sm:block h-6 w-28 bg-gray-200/70 rounded ml-2" />
            </Link>
            <div className="w-32 h-8 bg-gray-200/60 rounded" />
          </div>
        </div>
      </header>
    );
  }

  // ---- Main Header ----

  return (
    <header className="header-glass sticky top-0 z-40 supports-backdrop-blur:backdrop-blur bg-white/80 dark:bg-neutral-900/80 shadow-md border-b border-gray-200 dark:border-neutral-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group" tabIndex={0}>
            <span className="rounded-lg p-1 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 shadow transition group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="RentEasy Logo"
                width={40}
                height={40}
                className="rounded-md"
                priority
              />
            </span>
            <span className="hidden sm:block">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent tracking-tight drop-shadow group-hover:brightness-110 transition">
                RentEasy
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            <HeaderNavLink href="/properties">Properties</HeaderNavLink>
            <HeaderNavLink href="/requirements">Requirements</HeaderNavLink>
            {session?.user.role === "owner" && (
              <HeaderNavLink href="/dashboard/owner">
                Owner Dashboard
              </HeaderNavLink>
            )}
            {session?.user.role === "admin" && (
              <HeaderNavLink href="/admin">
                Admin Dashboard
              </HeaderNavLink>
            )}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link href="/bookmarks" className="relative" tabIndex={0}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/20 transition"
                  >
                    <Heart className="h-5 w-5 text-pink-500" aria-label="Bookmarks" />
                    {bookmarkCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-[18px] px-1.5 flex items-center justify-center border-2 border-white dark:border-neutral-900 shadow font-semibold">
                        {bookmarkCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* Role CTA */}
                {session.user.role === "owner" ? (
                  <Link href="/properties/new">
                    <Button
                      className="header-cta"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      List Property
                    </Button>
                  </Link>
                ) : session.user.role === "tenant" ? (
                  <Link href="/requirements/new">
                    <Button
                      className="header-cta"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Post Requirement
                    </Button>
                  </Link>
                ) : null}

                {/* Updated: Use UserMenu instead of the old chip */}
                <UserMenu
                  user={session.user}
                  name={session.user.name}
                  email={session.user.email}
                  image={session.user.image}
                  role={session.user.role}
                />

              </>
            ) : status !== "loading" ? (
              <>
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                  >Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    className="header-cta"
                  >Sign Up</Button>
                </Link>
              </>
            ) : null}

            {/* Hamburger for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden ml-0 p-2"
              onClick={() => setMobileMenu((a) => !a)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
        </div>
      </div>

      {/* ---- MOBILE SLIDE-OUT MENU ---- */}
      {mobileMenu && (
        <div className="fixed inset-0 bg-black/40 z-50 flex md:hidden">
          <div ref={navRef} className="bg-white dark:bg-neutral-900 w-5/6 max-w-xs p-6 h-full shadow-xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-bold text-blue-700 dark:text-blue-300">RentEasy</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setMobileMenu(false)}
              >
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </Button>
            </div>

            {/* Nav links */}
            <MobileNavLink onClick={() => setMobileMenu(false)} href="/properties">Properties</MobileNavLink>
            <MobileNavLink onClick={() => setMobileMenu(false)} href="/requirements">Requirements</MobileNavLink>
            {session?.user.role === "owner" && (
              <MobileNavLink onClick={() => setMobileMenu(false)} href="/dashboard/owner">Owner Dashboard</MobileNavLink>
            )}
            {session?.user.role === "admin" && (
              <MobileNavLink onClick={() => setMobileMenu(false)} href="/admin">Admin Dashboard</MobileNavLink>
            )}

            {/* Auth/CTA section */}
            <div className="border-t border-gray-200 dark:border-neutral-800 mt-6 pt-4 flex flex-col gap-3">
              {session ? (
                <>
                  <Link href="/bookmarks" tabIndex={0} onClick={() => setMobileMenu(false)}>
                    <span className="flex items-center gap-3 text-gray-700 dark:text-gray-200 text-base py-2 px-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <Heart className="h-5 w-5 text-pink-500" />
                      Bookmarks
                      {bookmarkCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">{bookmarkCount}</span>
                      )}
                    </span>
                  </Link>

                  {session.user.role === "owner" && (
                    <Link href="/properties/new" onClick={() => setMobileMenu(false)}>
                      <span className="flex items-center gap-3 py-2 px-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold">
                        <Plus className="w-4 h-4" /> List Property
                      </span>
                    </Link>
                  )}

                  {session.user.role === "tenant" && (
                    <Link href="/requirements/new" onClick={() => setMobileMenu(false)}>
                      <span className="flex items-center gap-3 py-2 px-2 rounded hover:bg-blue-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-semibold">
                        <Plus className="w-4 h-4" /> Post Requirement
                      </span>
                    </Link>
                  )}

                  {/* User info in mobile menu */}
                  <div className="flex items-center gap-2 px-2 mt-2">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full border-2 border-white shadow"
                      />
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 text-sm font-bold text-blue-700 dark:text-blue-200 uppercase border-2 border-white shadow">
                        {session.user.name?.[0] || <User className="w-5 h-5" />}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">{session.user.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto hover:bg-red-100 dark:hover:bg-red-900/20"
                      onClick={() => { setMobileMenu(false); signOut({ callbackUrl: "/" }); }}
                    >
                      <LogOut className="h-4 w-4 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" onClick={() => setMobileMenu(false)}>
                    <Button variant="outline" className="w-full dark:border-neutral-700 dark:text-gray-200">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenu(false)}>
                    <Button className="w-full header-cta">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header animation & util classes */}
      <style jsx global>{`
        .header-glass {
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          background: rgba(255,255,255,0.82);
        }
        .dark .header-glass {
          background: rgba(23, 23, 40, 0.85);
        }
        @media (max-width: 768px) {
          .header-glass { padding-left: 0.3rem; padding-right: 0.3rem;}
        }
        @keyframes slide-in {
          from { transform: translateX(-120%);}
          to { transform: translateX(0);}
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(.35,.61,.16,1);
        }
        .header-cta {
          background-image: linear-gradient(90deg,#805ad5 0,#3b82f6 100%);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 1px 6px 0 rgb(120 99 202/20%);
          border-radius: 0.5rem;
          outline: 0;
          border: none;
          transition: box-shadow 0.15s,transform .16s;
        }
        .header-cta:hover,.header-cta:focus{
          box-shadow: 0 4px 14px 0 rgba(120,99,202,0.16);
          filter: brightness(1.06);
          transform: scale(1.045);
        }
        .header-navlink {
          position: relative;
          font-weight: 600;
          color: #373a4d;
          padding-bottom: 1px;
          transition: color 0.16s;
          outline: none;
        }
        .dark .header-navlink {
          color: #d1d5db;
        }
        .header-navlink:focus-visible {
          color: #6d28d9;
        }
        .header-navlink::after {
          content: '';
          display: block;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, #3b82f6 0, #8b5cf6 100%);
          transition: width 0.22s;
          border-radius: 8px;
          margin: 2px auto 0 auto;
        }
        .header-navlink:hover,
        .header-navlink:focus {
          color: #6d28d9;
        }
        .dark .header-navlink:hover,
        .dark .header-navlink:focus {
          color: #a855f7;
        }
        .header-navlink:hover::after,
        .header-navlink:focus::after {
          width: 100%;
        }
        .animate-fade-up {
          animation: fadeUp 0.2s ease-out;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}

// Desktop nav link component for focus/hover effect
function HeaderNavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="header-navlink px-1.5 py-0.5 rounded focus-visible:ring-1 focus-visible:ring-blue-400" tabIndex={0}>
      {children}
    </Link>
  );
}

// Mobile nav link for consistent style
function MobileNavLink({ href, children, onClick }: { href: string, children: React.ReactNode, onClick?: () => void }) {
  return (
    <Link
      href={href}
      tabIndex={0}
      onClick={onClick}
      className="flex w-full items-center gap-2 text-gray-700 dark:text-gray-200 text-lg py-2 px-2 mb-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 focus-visible:bg-blue-100 dark:focus-visible:bg-blue-900/40 focus-visible:outline-none font-semibold"
    >{children}</Link>
  );
}
