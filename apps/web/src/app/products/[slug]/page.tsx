"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Check,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Minus,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Product } from "@/types";
import { apiClient } from "@/lib/api";
import { formatMoney, calculateDiscount } from "@/lib/format";
import { useCart } from "@/context/CartContext";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await apiClient<{ product: Product }>(`/products/${resolvedParams.slug}`);
        if (res.success && res.data?.product) {
          setProduct(res.data.product);
          const primary =
            res.data.product.images?.find((img) => img.isPrimary)?.url ||
            res.data.product.images?.[0]?.url ||
            "";
          setSelectedImage(primary);
        } else {
          setError(res.error?.message || "Product not found");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading product");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 w-48 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 rounded-3xl"></div>
          <div className="space-y-6">
            <div className="h-10 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-12 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Product Not Available</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{error || "The product you requested could not be located."}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const discountPercent = calculateDiscount(product.priceInCents, product.compareAtPriceInCents);

  const handleAddToCart = async () => {
    const res = await addToCart(product.id, quantity);
    if (res.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-indigo-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/products" className="hover:text-indigo-600 transition-colors">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-indigo-600 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Primary Main Image */}
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-sm relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white font-extrabold text-xs uppercase px-3 py-1 rounded-full shadow-md">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img.url
                      ? "border-indigo-600 ring-2 ring-indigo-600/20 shadow-md"
                      : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.altText || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Purchase Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                {product.category?.name || "Hardware"}
              </span>
              <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">4.9</span>
              <span className="text-xs text-slate-400">(128 customer reviews)</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              {formatMoney(product.priceInCents)}
            </span>
            {product.compareAtPriceInCents && (
              <span className="text-base text-slate-400 line-through">
                {formatMoney(product.compareAtPriceInCents)}
              </span>
            )}
            {discountPercent && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Save ${( (product.compareAtPriceInCents! - product.priceInCents) / 100 ).toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-slate-600 leading-relaxed space-y-2">
            <p>{product.description}</p>
          </div>

          {/* Stock Availability */}
          <div className="flex items-center gap-2 text-xs">
            {product.stock > 0 ? (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-emerald-700">In Stock</span>
                <span className="text-slate-400">({product.stock} units ready to ship)</span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                <span className="font-semibold text-rose-700">Out of Stock</span>
              </>
            )}
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || product.stock === 0}
                  className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-slate-800 text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || product.stock === 0}
                  className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  product.stock === 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : addedSuccess
                    ? "bg-emerald-600 text-white scale-[0.98] shadow-emerald-600/30"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:scale-[1.01]"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Shopping Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Add {quantity > 1 ? `(${quantity})` : ""} to Cart
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 rounded-xl bg-slate-50 space-y-1">
              <Truck className="w-4 h-4 text-indigo-600 mx-auto" />
              <p className="text-[11px] font-bold text-slate-800">Free Express Delivery</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 space-y-1">
              <ShieldCheck className="w-4 h-4 text-indigo-600 mx-auto" />
              <p className="text-[11px] font-bold text-slate-800">2-Year Warranty</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 space-y-1">
              <RotateCcw className="w-4 h-4 text-indigo-600 mx-auto" />
              <p className="text-[11px] font-bold text-slate-800">30-Day Free Returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
