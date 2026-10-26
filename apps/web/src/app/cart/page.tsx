"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertTriangle,
  PackageOpen,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="lg:col-span-4 h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotalInCents || 0;
  const shipping = cart?.shippingInCents || 0;
  const tax = cart?.taxInCents || 0;
  const total = cart?.totalInCents || 0;

  // Free shipping goal: $100 (10000 cents)
  const freeShippingThreshold = 10000;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-inner">
          <PackageOpen className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Your Shopping Cart is Empty
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Explore our curated catalog of precision audio, mechanical keyboards, and desk hardware.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          <ShoppingBag className="w-4 h-4" />
          Explore Storefront Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart ({cart?.itemCount} {cart?.itemCount === 1 ? "item" : "items"})
          </h1>
          <p className="text-xs text-slate-500">
            Items are saved automatically to your session and account
          </p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 self-start"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Item Rows */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </Link>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    {item.categoryName || "Hardware"}
                  </span>
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors leading-snug">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs font-semibold text-slate-500">
                    {formatMoney(item.unitPriceInCents)} each
                  </p>

                  {item.isOutOfStock && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Only {item.stockAvailable} available in stock
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity Controls & Line Price */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-xs">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-slate-800 text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stockAvailable}
                    className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <span className="font-black text-slate-900 text-base">
                    {formatMoney(item.lineTotalInCents)}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <h2 className="font-extrabold text-slate-900 text-lg">Order Summary</h2>

            {/* Free Shipping Progress Indicator */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  {amountNeededForFreeShipping === 0 ? "You have Free Express Shipping!" : `Add ${formatMoney(amountNeededForFreeShipping)} more for Free Shipping`}
                </span>
                <span>{freeShippingProgress}%</span>
              </div>
              <div className="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs border-b border-slate-100 pb-5">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span>
                  ) : (
                    formatMoney(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-900">{formatMoney(tax)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="font-extrabold text-base text-slate-900">Estimated Total</span>
              <span className="font-black text-2xl text-slate-900">{formatMoney(total)}</span>
            </div>

            {/* Proceed to Checkout Button */}
            <Link
              href="/checkout"
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              Proceed to Demo Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Trust Assurances */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Simulated Demo Checkout (No real credit card required)</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>30-Day Money Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
