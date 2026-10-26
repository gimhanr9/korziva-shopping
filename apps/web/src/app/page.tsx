"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Server, Globe, Database, ArrowRight, Activity, ShieldCheck, Layers } from "lucide-react";
import { apiClient } from "@/lib/api";

interface HealthData {
  status: string;
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  environment: string;
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
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        setLoading(true);
        const res = await apiClient<HealthData>("/health");
        if (res.success && res.data) {
          setHealth(res.data);
          setError(null);
        } else {
          setError(res.error?.message || "Failed to connect to Express API");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setLoading(false);
      }
    }
    checkHealth();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/70 text-slate-800">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20">
              SF
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Shop<span className="text-indigo-600">Flow</span>
            </span>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-100 ml-2">
              Stage 2 Database & Seeded
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Monorepo Active
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Enterprise Full-Stack E-Commerce Architecture
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Production-Minded Monorepo Scaffolded
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            ShopFlow is structured into a clean monorepo separating the customer-facing storefront (<code className="px-1.5 py-0.5 bg-slate-200/60 rounded text-slate-800 font-mono text-sm">apps/web</code>) and the robust Express REST backend (<code className="px-1.5 py-0.5 bg-slate-200/60 rounded text-slate-800 font-mono text-sm">apps/api</code>).
          </p>
        </div>

        {/* API Health Connectivity Live Card */}
        <div className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 text-base">Backend API Connectivity Check</h2>
                <p className="text-xs text-slate-500">HTTP communication between Next.js and Express API</p>
              </div>
            </div>
            <div>
              {loading ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping"></span>
                  Checking...
                </span>
              ) : health?.status === "ok" ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  API Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                  Connection Failed
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50">
              <span className="text-slate-500 font-medium">Target Endpoint:</span>
              <code className="text-indigo-600 font-mono font-medium text-xs">GET /api/health</code>
            </div>

            {health && (
              <>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50">
                  <span className="text-slate-500 font-medium">Service & Version:</span>
                  <span className="text-slate-800 font-medium">{health.service} v{health.version}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50">
                  <span className="text-slate-500 font-medium">Server Environment:</span>
                  <span className="text-slate-800 font-medium capitalize">{health.environment}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50">
                  <span className="text-slate-500 font-medium">Uptime:</span>
                  <span className="text-slate-800 font-mono text-xs">{health.uptime}s</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50">
                  <span className="text-slate-500 font-medium">Response Timestamp:</span>
                  <span className="text-slate-800 font-mono text-xs">{health.timestamp}</span>
                </div>
                {health.database && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Database Status</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {health.database.provider} Connected
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-base font-bold text-slate-900">{health.database.counts.products}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Products</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-base font-bold text-slate-900">{health.database.counts.categories}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Categories</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-base font-bold text-slate-900">{health.database.counts.users}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Users</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-base font-bold text-slate-900">{health.database.counts.orders}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Orders</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="p-3 bg-rose-50 rounded-lg text-rose-700 text-xs border border-rose-100">
                <p className="font-semibold">Connection Note:</p>
                <p>{error}</p>
                <p className="mt-1 text-slate-500">Ensure the Express API is running on port 5000.</p>
              </div>
            )}
          </div>
        </div>

        {/* Monorepo Architecture Overview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">apps/web (Frontend)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Next.js 15 App Router, React 19, TypeScript, and Tailwind CSS. Client-side HTTP fetching talking to Express REST API without server actions.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Port 3000</span>
              <span className="text-blue-600 font-medium">Storefront & Admin</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">apps/api (Backend)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Node.js Express with TypeScript, layered routes/controllers/services, Helmet, CORS, Zod validation, rate limiting, and centralized error handling.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Port 5000</span>
              <span className="text-indigo-600 font-medium">REST API Layer</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">PostgreSQL & Prisma</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Schema migrated and seeded. Money stored in minor units (cents). Relational models for users, products, categories, cart, orders, and addresses.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>PostgreSQL 18</span>
              <span className="text-emerald-600 font-medium">Migrated & Seeded</span>
            </div>
          </div>
        </div>

        {/* Roadmap Banner */}
        <div className="mt-12 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              Workflow Progress
            </div>
            <h4 className="text-xl font-bold">Stage 2 Database & Seed Complete</h4>
            <p className="text-slate-400 text-sm max-w-xl">
              PostgreSQL schema migrated, Prisma Client generated, and realistic sample data seeded. Ready for Stage 3 (Authentication, Authorization & Product APIs).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3.5 py-2 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Stage 2 Verified
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
