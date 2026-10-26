"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  PackageCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                Shop<span className="text-indigo-600">Flow</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase mt-0.5">
                Modern Commerce
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-indigo-600 transition-colors">
              Products
            </Link>
            <Link href="/products?featured=true" className="hover:text-indigo-600 transition-colors">
              Featured
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-xs relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Right Actions: Cart & Account */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link
              href="/products"
              title="Cart items"
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold h-5 min-w-5 px-1 rounded-full flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium transition-colors bg-white shadow-sm"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user.firstName[0]}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {user.firstName}
                  </span>
                  {user.role === "ADMIN" && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded">
                      Admin
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      My Profile & Addresses
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 font-medium hover:bg-amber-50 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Browse All Products
              </Link>
              <Link
                href="/products?featured=true"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Featured Collections
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
