"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Package,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/format";

interface AdminMetrics {
  totalRevenueInCents: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalInCents: number;
    status: string;
    createdAt: string;
    items: { id: string; productName: string; quantity: number }[];
  }[];
  salesHistory: {
    date: string;
    revenueInCents: number;
    orderCount: number;
  }[];
  lowStockItems: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    priceInCents: number;
    category?: { name: string };
  }[];
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient<AdminMetrics>("/admin/metrics");
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await apiClient(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        await fetchMetrics();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRestock = async (productId: string, currentStock: number) => {
    try {
      setUpdatingStockId(productId);
      const res = await apiClient(`/admin/products/${productId}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ stock: currentStock + 25 }),
      });
      if (res.success) {
        await fetchMetrics();
      }
    } catch (err) {
      console.error("Failed to restock:", err);
    } finally {
      setUpdatingStockId(null);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8 text-center text-slate-400">
        Failed to load administrative analytics. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administrative Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time sales performance, inventory thresholds, and order fulfillment status
          </p>
        </div>

        <button
          onClick={() => fetchMetrics()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Data
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {formatMoney(metrics.totalRevenueInCents)}
          </div>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Processed payments from database
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{metrics.totalOrders}</div>
          <p className="text-[11px] text-slate-400 font-medium">Customer purchases created</p>
        </div>

        {/* Active Customers */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Registered Customers
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{metrics.totalCustomers}</div>
          <p className="text-[11px] text-slate-400 font-medium">Customer user accounts</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className={`p-2.5 rounded-xl border ${
              metrics.lowStockCount > 0
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{metrics.lowStockCount}</div>
          <p className="text-[11px] text-amber-400 font-medium">Products with stock ≤ 20</p>
        </div>
      </div>

      {/* Date-Based Sales Activity Summary */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-white text-lg">Sales Activity & Daily Volume</h2>
            <p className="text-xs text-slate-400">Order revenue trends calculated from PostgreSQL</p>
          </div>
        </div>

        {metrics.salesHistory.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No recent daily sales data available.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {metrics.salesHistory.map((day) => (
              <div key={day.date} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500">{day.date}</span>
                <p className="text-base font-black text-white">{formatMoney(day.revenueInCents)}</p>
                <p className="text-[11px] text-indigo-400 font-medium">{day.orderCount} {day.orderCount === 1 ? "order" : "orders"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Grid: Recent Orders & Low Stock Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders with Live Status Selector */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-white text-lg">Recent Customer Orders</h2>
              <p className="text-xs text-slate-400">Manage fulfillment and order state machine</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              All Orders
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3 rounded-r-xl">Status & Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-white text-[11px]">
                      {order.orderNumber}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-200">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{order.customerEmail}</p>
                    </td>
                    <td className="p-3 text-slate-400">
                      {order.items?.length || 0} items
                    </td>
                    <td className="p-3 font-bold text-white">
                      {formatMoney(order.totalInCents)}
                    </td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer border ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                            : order.status === "PROCESSING"
                            ? "bg-blue-950 text-blue-300 border-blue-800"
                            : order.status === "SHIPPED"
                            ? "bg-indigo-950 text-indigo-300 border-indigo-800"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Management Card */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-white text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Low Stock Warnings
            </h2>
            <Link href="/admin/products" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {metrics.lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-500">All inventory levels are currently healthy.</p>
            ) : (
              metrics.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="font-bold text-slate-200 truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</p>
                    <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-md">
                      {item.stock} in stock
                    </span>
                  </div>

                  <button
                    onClick={() => handleRestock(item.id, item.stock)}
                    disabled={updatingStockId === item.id}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    +25 Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
