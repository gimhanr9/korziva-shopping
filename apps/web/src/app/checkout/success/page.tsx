"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/format";

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddressSnapshot: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotalInCents: number;
  shippingInCents: number;
  taxInCents: number;
  totalInCents: number;
  status: string;
  paymentStatus: string;
  paymentReference?: string;
  paymentProvider: string;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    productSku: string;
    unitPriceInCents: number;
    quantity: number;
    totalPriceInCents: number;
    productImageUrl?: string | null;
  }[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) {
        setError("No order number specified in confirmation request.");
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient<{ order: OrderDetail }>(`/orders/${orderNumber}`);
        if (res.success && res.data?.order) {
          setOrder(res.data.order);
        } else {
          setError(res.error?.message || "Order not found");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load order receipt");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto"></div>
        <div className="h-6 w-48 bg-slate-200 rounded mx-auto"></div>
        <div className="h-4 w-64 bg-slate-200 rounded mx-auto"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">{error || "The requested order could not be loaded."}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddressSnapshot;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Success Hero Confirmation */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md shadow-emerald-600/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Payment Authorized & Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          We&apos;ve sent an order confirmation to <strong className="text-slate-900">{order.customerEmail}</strong>.
        </p>
      </div>

      {/* Order Meta Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
        <div>
          <span className="text-slate-400 font-medium">Order Number:</span>
          <p className="font-bold text-indigo-600 font-mono text-sm mt-0.5">{order.orderNumber}</p>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Order Date:</span>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Order Status:</span>
          <p className="font-bold text-emerald-600 uppercase text-xs mt-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            {order.status}
          </p>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Payment Reference:</span>
          <p className="font-mono text-slate-700 text-xs mt-0.5 truncate">{order.paymentReference || "N/A"}</p>
        </div>
      </div>

      {/* Itemized Order Receipt */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Ordered Items ({order.items.length})</h2>

        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                {item.productImageUrl && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.productName}</h3>
                  <p className="text-slate-400 font-mono text-[11px]">SKU: {item.productSku}</p>
                  <p className="text-slate-500 mt-0.5">
                    {item.quantity} × {formatMoney(item.unitPriceInCents)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-slate-900 text-sm">
                  {formatMoney(item.totalPriceInCents)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">{formatMoney(order.subtotalInCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-semibold text-slate-900">
              {order.shippingInCents === 0 ? "Free" : formatMoney(order.shippingInCents)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Tax</span>
            <span className="font-semibold text-slate-900">{formatMoney(order.taxInCents)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-3 border-t border-slate-100 text-sm">
            <span className="font-black text-slate-900">Total Paid</span>
            <span className="font-black text-2xl text-slate-900">{formatMoney(order.totalInCents)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-indigo-600" />
          Shipping Destination Snapshot
        </h3>
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-900">{addr.fullName}</p>
          <p>{addr.street}</p>
          <p>{addr.city}, {addr.state} {addr.postalCode}</p>
          <p className="font-medium text-slate-800">{addr.country}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/orders"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          View in My Orders
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/products"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto py-20 text-center">Loading confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
