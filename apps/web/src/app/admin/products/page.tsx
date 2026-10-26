"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { Category } from "@/types";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  priceInCents: number;
  compareAtPriceInCents?: number | null;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  category?: { name: string; slug: string };
  images: { id: string; url: string; isPrimary: boolean }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Create Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    compareAtPrice: "",
    stock: "25",
    sku: "",
    categoryId: "",
    imageUrl: "",
    isFeatured: false,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedCategory !== "all") params.set("categoryId", selectedCategory);

      const [prodRes, catRes] = await Promise.all([
        apiClient<{ products: AdminProduct[] }>(`/admin/products?${params.toString()}`),
        apiClient<{ categories: Category[] }>("/admin/categories"),
      ]);

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data.products);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data.categories);
        if (!formData.categoryId && catRes.data.categories.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: catRes.data!.categories[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load admin products:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, formData.categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStockUpdate = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    try {
      const res = await apiClient(`/admin/products/${productId}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to deactivate this product?")) return;
    try {
      const res = await apiClient(`/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isActive: false } : p))
        );
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceCents = Math.round(parseFloat(formData.price) * 100);
    const comparePriceCents = formData.compareAtPrice
      ? Math.round(parseFloat(formData.compareAtPrice) * 100)
      : null;

    if (isNaN(priceCents) || priceCents <= 0) {
      setFormError("Please enter a valid price.");
      return;
    }

    try {
      setCreating(true);
      const res = await apiClient("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug.toLowerCase().trim(),
          description: formData.description,
          priceInCents: priceCents,
          compareAtPriceInCents: comparePriceCents,
          stock: parseInt(formData.stock, 10) || 0,
          sku: formData.sku.toUpperCase().trim(),
          categoryId: formData.categoryId,
          isFeatured: formData.isFeatured,
          imageUrls: formData.imageUrl ? [formData.imageUrl] : [],
        }),
      });

      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          name: "",
          slug: "",
          description: "",
          price: "",
          compareAtPrice: "",
          stock: "25",
          sku: "",
          categoryId: categories[0]?.id || "",
          imageUrl: "",
          isFeatured: false,
        });
        await loadData();
      } else {
        setFormError(res.error?.message || "Failed to create product");
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Products & Inventory Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage catalog specifications, stock counts, and pricing
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-medium focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Adjustment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((product) => {
                const primaryImage =
                  product.images?.find((img) => img.isPrimary)?.url ||
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";

                return (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm line-clamp-1">{product.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</p>
                          {product.isFeatured && (
                            <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.2 rounded font-bold uppercase">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-400 font-medium">
                      {product.category?.name || "General"}
                    </td>

                    <td className="p-4 font-bold text-white text-sm">
                      {formatMoney(product.priceInCents)}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-md ${
                            product.stock <= 10
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : product.stock <= 20
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-slate-800 text-slate-200"
                          }`}
                        >
                          {product.stock} units
                        </span>
                        <button
                          onClick={() => handleStockUpdate(product.id, product.stock + 10)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-[10px] font-bold rounded-lg transition-colors"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleStockUpdate(product.id, Math.max(0, product.stock - 5))}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 text-[10px] font-bold rounded-lg transition-colors"
                          title="Deduct 5 units"
                        >
                          -5
                        </button>
                      </div>
                    </td>

                    <td className="p-4">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded-full">
                          Archived
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Archive Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                Add New Product
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setFormData({ ...formData, name, slug });
                  }}
                  placeholder="e.g. Studio Pro Spatial Monitor"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="KZ-PRO-001"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="199.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Compare-At</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="249.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive technical specifications and product highlights..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                ></textarea>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  Promote as Featured Item on Storefront
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
