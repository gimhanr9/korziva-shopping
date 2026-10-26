"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/format";

interface AdminOrder {
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
  }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await apiClient<{ orders: AdminOrder[] }>(`/admin/orders?${params.toString()}`);
      if (res.success && res.data) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await apiClient(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Customer Orders Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track fulfillment, customer shipments, and update order statuses
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by order #, email, or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Order Details</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Shipping Destination</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading orders from database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const addr = order.shippingAddressSnapshot;
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 space-y-1">
                        <span className="font-mono font-bold text-white text-xs block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-medium block">
                          {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </span>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <p className="font-bold text-slate-200">{order.customerName}</p>
                        <p className="text-[11px] text-slate-400">{order.customerEmail}</p>
                        {order.customerPhone && (
                          <p className="text-[10px] text-slate-500">{order.customerPhone}</p>
                        )}
                      </td>

                      <td className="p-4 text-[11px] text-slate-400 space-y-0.5 max-w-xs">
                        <p className="text-slate-200 font-medium">{addr.street}</p>
                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="text-[10px] text-slate-500">{addr.country}</p>
                      </td>

                      <td className="p-4">
                        <span className="font-black text-white text-sm block">
                          {formatMoney(order.totalInCents)}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium block uppercase">
                          Paid ({order.paymentProvider})
                        </span>
                      </td>

                      <td className="p-4">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer border ${
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
