"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X, PackageOpen } from "lucide-react";
import { Product, Category, PaginationMeta } from "@/types";
import { apiClient } from "@/lib/api";
import { ProductCard } from "@/components/ui/ProductCard";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialSort = searchParams.get("sort") || "newest";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialFeatured = searchParams.get("featured") === "true";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasMore: false,
  });

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [featured, setFeatured] = useState(initialFeatured);
  const [loading, setLoading] = useState(true);

  // Load Categories once
  useEffect(() => {
    async function loadCategories() {
      const res = await apiClient<{ categories: Category[] }>("/categories");
      if (res.success && res.data) {
        setCategories(res.data.categories);
      }
    }
    loadCategories();
  }, []);

  // Fetch Products based on filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category && category !== "all") params.set("category", category);
      if (sort) params.set("sort", sort);
      if (page > 1) params.set("page", page.toString());
      if (featured) params.set("featured", "true");

      const res = await apiClient<{ products: Product[]; meta: PaginationMeta }>(
        `/products?${params.toString()}`
      );

      if (res.success && res.data) {
        setProducts(res.data.products);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page, featured]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (slug: string) => {
    setCategory(slug);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("newest");
    setFeatured(false);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Product Catalog
        </h1>
        <p className="text-sm text-slate-500">
          Showing {meta.total} precision-engineered items available in our store.
        </p>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by product name, keywords, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Sort and Filters */}
        <div className="flex items-center gap-3">
          {/* Featured Toggle */}
          <button
            onClick={() => {
              setFeatured(!featured);
              setPage(1);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              featured
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Featured Only
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-600 border border-slate-200 rounded-xl px-3 py-2 bg-white">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-transparent focus:outline-none text-slate-800 font-medium cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategoryChange("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            category === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.slug)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              category === cat.slug
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat.name}
            {cat._count?.products !== undefined && (
              <span className="ml-1.5 opacity-70 text-[10px]">({cat._count.products})</span>
            )}
          </button>
        ))}
      </div>

      {/* Product Grid / Loading / Empty States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-slate-200/60 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900">No products match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms, changing the category filter, or resetting all filters.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-sm ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
