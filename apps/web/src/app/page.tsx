"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { Product, Category } from "@/types";
import { apiClient } from "@/lib/api";
import { ProductCard } from "@/components/ui/ProductCard";

interface HealthData {
  status: string;
  service: string;
  version: string;
  uptime: number;
  database?: {
    status: string;
    provider: string;
    counts: {
      users: number;
      products: number;
      categories: number;
      orders: number;
    };
  };
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [prodRes, catRes, healthRes] = await Promise.all([
          apiClient<{ products: Product[] }>("/products/featured"),
          apiClient<{ categories: Category[] }>("/categories"),
          apiClient<HealthData>("/health"),
        ]);

        if (prodRes.success && prodRes.data) {
          setFeaturedProducts(prodRes.data.products);
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data.categories);
        }
        if (healthRes.success && healthRes.data) {
          setHealth(healthRes.data);
        }
      } catch (err) {
        console.error("Failed to load storefront data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                New Fall Hardware & Workspace Collection
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                Curated Gear for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-white">
                  Modern Makers
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Experience studio-grade acoustics, bespoke mechanical keyboards, and precision peripherals built for focus, productivity, and timeless craft.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Explore Catalog
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products?featured=true"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-md border border-white/10 transition-all"
                >
                  Featured Collections
                </Link>
              </div>

              {/* Quick stats banner */}
              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-800/80 max-w-md">
                <div>
                  <div className="text-2xl font-black text-white">99.8%</div>
                  <div className="text-xs text-slate-400">Satisfaction Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">2-Day</div>
                  <div className="text-xs text-slate-400">Fast Shipping</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">2-Year</div>
                  <div className="text-xs text-slate-400">Full Warranty</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm lg:max-w-none rounded-3xl bg-gradient-to-tr from-white/10 to-white/5 p-4 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="aspect-square rounded-2xl overflow-hidden relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
                    alt="AeroTune Spatial ANC Headphones"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/90 backdrop-blur-md text-slate-900 flex items-center justify-between shadow-lg">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        Staff Pick
                      </span>
                      <h3 className="font-bold text-sm">AeroTune Spatial ANC</h3>
                      <p className="text-xs font-extrabold text-slate-900">$249.00</p>
                    </div>
                    <Link
                      href="/products/aerotune-spatial-anc-headphones"
                      className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                      title="View product"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            All Products
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 shadow-sm hover:shadow-md transition-all border border-slate-200/80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.imageUrl || "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"}
                alt={cat.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-base group-hover:text-indigo-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-slate-300 text-xs mt-0.5">
                  {cat._count?.products || 0} Products Available
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Trending
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Featured Hardware
            </h2>
          </div>
          <Link
            href="/products?featured=true"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            View All Featured
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-slate-200/70 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Deal Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Limited Edition
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold">
              Save 20% on Studio Workstation Bundles
            </h3>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Equip your workspace with our high-precision mechanical keyboards and 4K studio monitors. Built for developers, designers, and audio creators.
            </p>
            <div className="pt-2">
              <Link
                href="/products?category=workstation-tech"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-950 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-md"
              >
                Shop Workstation Gear
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live System Diagnostics Card */}
      {health && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Full-Stack System Status</h4>
                  <p className="text-xs text-slate-500">Live communication with Express REST API & PostgreSQL</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  API & Database Online
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                  Stage 3 Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-center">
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-xl font-extrabold text-slate-900">{health.database?.counts.products ?? 0}</div>
                <div className="text-xs text-slate-500 font-medium">Catalog Products</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-xl font-extrabold text-slate-900">{health.database?.counts.categories ?? 0}</div>
                <div className="text-xs text-slate-500 font-medium">Active Categories</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-xl font-extrabold text-slate-900">{health.database?.counts.users ?? 0}</div>
                <div className="text-xs text-slate-500 font-medium">Registered Users</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-xl font-extrabold text-slate-900">{health.database?.counts.orders ?? 0}</div>
                <div className="text-xs text-slate-500 font-medium">Total Orders</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
