"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LogOut, User, Settings, Heart, LayoutDashboard, Home, Plus
} from "lucide-react";

export default function UserMenu({
  user,
  role,
  image,
  name = "",
  email = "",
  extra = null,
}: {
  user: any;
  role: string;
  image?: string;
  name?: string;
  email?: string;
  extra?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when you click outside
  useEffect(() => {
    if (!open) return;
    const listener = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [open]);

  // ✅ ROLE-BASED URLs FOR PROFILE & SETTINGS
  const getProfileUrl = () => {
    switch(role) {
      case "owner": return "/dashboard/owner/profile";
      case "tenant": return "/tenant/profile"; // or "/tenant/profile" if you create tenant-specific page
      case "admin": return "/admin/profile";  
      default: return "/profile";
    }
  };

  const getSettingsUrl = () => {
    switch(role) {
      case "owner": return "/dashboard/owner/settings";
      case "tenant": return "/tenant/settings"; 
      case "admin": return "/admin/settings";
      default: return "/settings";
    }
  };

  const avatar = !!image ? (
    <img src={image} alt={name} className="w-8 h-8 rounded-full object-cover border-2 border-white shadow" />
  ) : (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 text-xl font-bold text-blue-700 uppercase border-2 border-white shadow">
      {name ? name[0] : <User className="w-6 h-6" />}
    </span>
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100/80 hover:bg-gray-200/90 active:scale-95 border cursor-pointer shadow-sm transition"
        onClick={() => setOpen((x) => !x)}
        tabIndex={0}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {avatar}
        <span className="hidden sm:block text-sm font-medium text-gray-700 truncate max-w-[110px]">{name}</span>
        <svg className={`w-4 h-4 ml-1 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
      </button>
      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-56 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-xl py-2 animate-fade-up"
          role="menu"
          tabIndex={-1}
        >
          <div className="px-4 py-3 flex items-center gap-3">
            {avatar}
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{name}</div>
              {email && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</div>
              )}
              {role && (
                <div className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 uppercase">
                  {role}
                </div>
              )}
            </div>
          </div>
          <div className="my-1 border-b border-gray-100 dark:border-neutral-800" />

          {/* Menu items */}
          <ul className="py-1" role="none">
            {/* ✅ Role-based Profile URL */}
            <li>
              <Link href={getProfileUrl()} className="dropdown-item">
                <User className="w-4 h-4 mr-2" />
                My Profile
              </Link>
            </li>

            {/* Bookmarks for tenant and owner */}
            {(role === "tenant" || role === "owner") && (
              <li>
                <Link href="/bookmarks" className="dropdown-item">
                  <Heart className="w-4 h-4 mr-2 text-pink-500" />
                  Bookmarks
                </Link>
              </li>
            )}

            {/* Tenant: Post Requirement */}
            {role === "tenant" && (
              <li>
                <Link href="/requirements/new" className="dropdown-item">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Requirement
                </Link>
              </li>
            )}

            {/* Owner-specific */}
            {role === "owner" && (
              <>
                <li>
                  <Link href="/dashboard/owner" className="dropdown-item">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Owner Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/properties" className="dropdown-item">
                    <Home className="w-4 h-4 mr-2" />
                    My Properties
                  </Link>
                </li>
                <li>
                  <Link href="/properties/new" className="dropdown-item">
                    <Plus className="w-4 h-4 mr-2" />
                    List Property
                  </Link>
                </li>
              </>
            )}

            {/* Admin-specific */}
            {role === "admin" && (
              <li>
                <Link href="/admin" className="dropdown-item">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Link>
              </li>
            )}

            {/* ✅ Role-based Settings URL */}
            <li>
              <Link href={getSettingsUrl()} className="dropdown-item">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </li>
            {extra}
          </ul>
          <div className="my-1 border-b border-gray-100 dark:border-neutral-800" />
          <div className="flex">
            <button
              className="dropdown-item text-red-600 hover:bg-red-50 dark:hover:bg-red-900 w-full"
              onClick={() => signOut({ callbackUrl: "/" })}
              role="menuitem"
              tabIndex={0}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </button>
          </div>
        </div>
      )}
      <style jsx global>{`
        .dropdown-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 8px 1.1rem;
          font-size: 1rem;
          color: #2d2a3a;
          background: none;
          transition: background 0.12s;
          border-radius: 0.375rem;
        }
        .dropdown-item:hover,
        .dropdown-item:focus-visible {
          background: #f7fafc;
          color: #281e80;
        }
        .dark .dropdown-item:hover,
        .dark .dropdown-item:focus-visible {
          background: #282848;
          color: #b4a3f2;
        }
      `}</style>
    </div>
  );
}
