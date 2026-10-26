"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PackageCheck,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/format";

interface CustomerOrder {
  id: string;
  orderNumber: string;
  subtotalInCents: number;
  shippingInCents: number;
  taxInCents: number;
  totalInCents: number;
  status: string;
  paymentStatus: string;
  paymentReference?: string;
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

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        const res = await apiClient<{ orders: CustomerOrder[] }>("/orders/my-orders");
        if (res.success && res.data) {
          setOrders(res.data.orders);
        } else {
          setError(res.error?.message || "Failed to load orders");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error fetching orders");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadOrders();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Delivered
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-blue-600" />
            Processing
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            <Truck className="w-3 h-3 text-indigo-600" />
            In Transit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Orders ({orders.length})
          </h1>
          <p className="text-xs text-slate-500">
            Review your order history, delivery receipts, and fulfillment status
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          Browse More Products
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <PackageCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900">No orders placed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once you checkout with precision gear from our store, your purchase receipts will appear here.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-sm transition-all"
            >
              {/* Order Header Strip */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-400 font-medium">Order Number</span>
                    <p className="font-bold text-slate-900 font-mono mt-0.5">{order.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Date Placed</span>
                    <p className="font-bold text-slate-900 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Total Amount</span>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{formatMoney(order.totalInCents)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <Link
                    href={`/checkout/success?orderNumber=${order.orderNumber}`}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
                    title="View Receipt"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-6 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      {item.productImageUrl && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                        <p className="text-slate-400 font-mono text-[11px]">SKU: {item.productSku}</p>
                        <p className="text-slate-500 mt-0.5">
                          Quantity: {item.quantity} × {formatMoney(item.unitPriceInCents)}
                        </p>
                      </div>
                    </div>

                    <span className="font-bold text-slate-900 text-sm">
                      {formatMoney(item.totalPriceInCents)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
