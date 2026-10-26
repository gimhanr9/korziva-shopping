import React from "react";
import Link from "next/link";
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">Free Express Shipping</p>
              <p className="text-[11px] text-slate-500">On all orders over $100</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">2-Year Warranty</p>
              <p className="text-[11px] text-slate-500">Genuine quality guaranteed</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">30-Day Hassle-Free Returns</p>
              <p className="text-[11px] text-slate-500">Quick refunds or replacements</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">24/7 Dedicated Support</p>
              <p className="text-[11px] text-slate-500">Direct human assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-white">
              Kor<span className="text-indigo-400">ziva</span>
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            A production-minded e-commerce web platform for small businesses. Engineered with Next.js, Express, PostgreSQL, and Prisma.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-xs mb-3">
            Storefront
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/products" className="hover:text-white transition-colors">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/products?category=audio-acoustics" className="hover:text-white transition-colors">
                Audio & Acoustics
              </Link>
            </li>
            <li>
              <Link href="/products?category=workstation-tech" className="hover:text-white transition-colors">
                Workstation Peripherals
              </Link>
            </li>
            <li>
              <Link href="/products?category=lifestyle-carry" className="hover:text-white transition-colors">
                Lifestyle & Carry
              </Link>
            </li>
            <li>
              <Link href="/products?category=smart-home" className="hover:text-white transition-colors">
                Smart Home
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-xs mb-3">
            Customer Care
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/login" className="hover:text-white transition-colors">
                Customer Sign In
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white transition-colors">
                Create Account
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-white transition-colors">
                Track My Order
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white transition-colors">
                Admin Management Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Our Promise */}
        <div>
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-xs mb-3">
            Our Guarantee
          </h4>
          <p className="text-slate-400 leading-relaxed mb-3">
            Every Korziva product is backed by a 2-year manufacturer warranty, 30-day trial period, and direct human customer support.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            100% Carbon Neutral Global Fulfillment
          </div>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="border-t border-slate-800 py-6 text-center text-slate-500 text-[11px]">
        &copy; {new Date().getFullYear()} Korziva Inc. All rights reserved. Built for modern creators and makers worldwide.
      </div>
    </footer>
  );
}
