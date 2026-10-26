"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Tags, Plus, Trash2, X, FolderTree } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    displayOrder: "0",
  });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ categories: Category[] }>("/admin/categories");
      if (res.success && res.data) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      const res = await apiClient("/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug.toLowerCase().trim(),
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          displayOrder: parseInt(formData.displayOrder, 10) || 0,
        }),
      });

      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          name: "",
          slug: "",
          description: "",
          imageUrl: "",
          displayOrder: "0",
        });
        await loadCategories();
      } else {
        setError(res.error?.message || "Failed to create category");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await apiClient(`/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        await loadCategories();
      } else {
        alert(res.error?.message || "Cannot delete category");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Storefront Categories
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize products and collections across the customer storefront
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image banner */}
              <div className="aspect-[16/9] bg-slate-950 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.imageUrl || "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"}
                  alt={cat.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded-md">
                  /{cat.slug}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{cat.name}</h3>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded-full">
                    {cat._count?.products || 0} products
                  </span>
                </div>
                {cat.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-800/60 mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Order: {cat.displayOrder}</span>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Tags className="w-5 h-5 text-indigo-400" />
                Create New Category
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setFormData({ ...formData, name, slug });
                  }}
                  placeholder="e.g. Mechanical Studio Peripherals"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="mechanical-studio-peripherals"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of items in this collection..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
