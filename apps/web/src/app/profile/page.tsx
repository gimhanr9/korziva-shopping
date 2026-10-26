"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, MapPin, Package, ShieldCheck, Mail, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/format";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded mx-auto mb-4"></div>
        <div className="h-4 w-64 bg-slate-200 rounded mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 uppercase">
            {user.firstName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {user.firstName} {user.lastName}
              </h1>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                user.role === "ADMIN" ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user.email}
            </p>
          </div>
        </div>

        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 self-start"
          >
            Access Admin Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Account Details & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Orders
          </span>
          <div className="text-3xl font-extrabold text-slate-900">
            {user._count?.orders ?? 0}
          </div>
          <p className="text-xs text-indigo-600 font-medium pt-1">Lifetime customer purchases</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Account Status
          </span>
          <div className="text-xl font-bold text-emerald-600 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-5 h-5" />
            Verified & Active
          </div>
          <p className="text-xs text-slate-500 pt-1">Secure session management</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Member Since
          </span>
          <div className="text-lg font-bold text-slate-900 pt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            {user.createdAt ? formatDate(user.createdAt) : "Active Member"}
          </div>
          <p className="text-xs text-slate-500 pt-1">Korziva Customer Account</p>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Saved Shipping Addresses
          </h2>
        </div>

        {user.addresses && user.addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-5 rounded-2xl border transition-all bg-white relative ${
                  addr.isDefault
                    ? "border-indigo-600 ring-1 ring-indigo-600/20 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                    Default Address
                  </span>
                )}
                <h3 className="font-bold text-sm text-slate-900">{addr.fullName}</h3>
                <p className="text-xs text-slate-600 mt-1">{addr.street}</p>
                <p className="text-xs text-slate-600">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{addr.country}</p>
                {addr.phone && (
                  <p className="text-xs text-slate-400 mt-2">Phone: {addr.phone}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No saved addresses found. Addresses will be saved automatically during checkout.
          </div>
        )}
      </div>
    </div>
  );
}
