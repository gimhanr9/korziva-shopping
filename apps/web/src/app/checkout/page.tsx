"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Lock,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { apiClient } from "@/lib/api";
import { formatMoney } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    saveAddress: false,
  });

  const [paymentMethod, setPaymentMethod] = useState("demo_card");
  const [demoCardNumber, setDemoCardNumber] = useState("4242 •••• •••• 4242");
  const [demoExpiry, setDemoExpiry] = useState("12/28");
  const [demoCvc, setDemoCvc] = useState("123");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill user data and default address if logged in
  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      setFormData((prev) => ({
        ...prev,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        customerPhone: defaultAddr?.phone || "",
        fullName: defaultAddr?.fullName || `${user.firstName} ${user.lastName}`,
        street: defaultAddr?.street || "",
        city: defaultAddr?.city || "",
        state: defaultAddr?.state || "",
        postalCode: defaultAddr?.postalCode || "",
        country: defaultAddr?.country || "US",
      }));
    }
  }, [user]);

  const items = cart?.items || [];
  const subtotal = cart?.subtotalInCents || 0;
  const shipping = cart?.shippingInCents || 0;
  const tax = cart?.taxInCents || 0;
  const total = cart?.totalInCents || 0;

  // Handle select from saved address
  const handleSelectAddress = (addrId: string) => {
    const selected = user?.addresses?.find((a) => a.id === addrId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        fullName: selected.fullName,
        street: selected.street,
        city: selected.city,
        state: selected.state,
        postalCode: selected.postalCode,
        country: selected.country,
        customerPhone: selected.phone || prev.customerPhone,
      }));
    }
  };

  const handleDemoFill = () => {
    setFormData((prev) => ({
      ...prev,
      customerName: prev.customerName || "Dineth Gimhan",
      customerEmail: prev.customerEmail || "customer@korziva.dev",
      customerPhone: "+1 (555) 765-4321",
      fullName: "Dineth Customer",
      street: "742 Evergreen Terrace",
      city: "Springfield",
      state: "OR",
      postalCode: "97477",
      country: "US",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty. Please add items before checking out.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || undefined,
        shippingAddress: {
          fullName: formData.fullName,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.customerPhone || undefined,
        },
        saveAddress: formData.saveAddress,
        paymentMethod,
        idempotencyKey: `sf_checkout_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };

      const res = await apiClient<{ order: { orderNumber: string } }>("/orders/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success && res.data?.order) {
        await refreshCart();
        router.push(`/checkout/success?orderNumber=${res.data.order.orderNumber}`);
      } else {
        setError(res.error?.message || "Checkout could not be processed. Please try again.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout transaction failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-sm hover:bg-indigo-700"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/cart" className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium">
              <ChevronLeft className="w-4 h-4" />
              Return to Cart
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Checkout & Order Review
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          256-bit SSL Encrypted Checkout
        </div>
      </div>

      {/* Trust and Security Banner */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold text-slate-900">Guaranteed Safe Checkout</span> &bull; 30-Day Returns &bull; 2-Year Warranty
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          Pre-Configured Instant Payment Authorization
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Details, Address & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Contact Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Customer Information
              </h2>
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 underline"
              >
                Prefill Sample Address
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Dineth Gimhan"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="e.g. customer@korziva.dev"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Phone Number (optional)</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
              />
            </div>
          </div>

          {/* Section 2: Shipping Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Shipping Address
              </h2>
            </div>

            {/* Saved addresses shortcut for authenticated user */}
            {user?.addresses && user.addresses.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Select Saved Address:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {user.addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectAddress(addr.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        formData.street === addr.street
                          ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <p className="font-bold text-slate-900">{addr.fullName}</p>
                      <p className="text-slate-500 truncate">{addr.street}, {addr.city}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Recipient full name"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="e.g. 742 Evergreen Terrace"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Springfield"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="OR"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="97477"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                  />
                </div>
              </div>

              {user && (
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.saveAddress}
                      onChange={(e) => setFormData({ ...formData, saveAddress: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    Save this address to my account for faster checkout next time
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Demo Payment Provider */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Payment Method
              </h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                Pre-Authorized
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-indigo-200/80 bg-indigo-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">Credit or Debit Card</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Instant Verification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Card Number</label>
                  <input
                    type="text"
                    disabled
                    value={demoCardNumber}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Expires</label>
                  <input
                    type="text"
                    disabled
                    value={demoExpiry}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Placement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="font-extrabold text-slate-900 text-lg">Order Items ({items.length})</h2>

            {/* Item List Thumbnails */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                      <p className="text-slate-500">Qty: {item.quantity} × {formatMoney(item.unitPriceInCents)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    {formatMoney(item.lineTotalInCents)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span> : formatMoney(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-900">{formatMoney(tax)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-4 border-t border-slate-100">
              <span className="font-black text-slate-900 text-base">Order Total</span>
              <span className="font-black text-2xl text-slate-900">{formatMoney(total)}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01]"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing Transaction...
                </span>
              ) : (
                <>
                  Complete Order
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              By placing your order, you agree to Korziva&apos;s Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
