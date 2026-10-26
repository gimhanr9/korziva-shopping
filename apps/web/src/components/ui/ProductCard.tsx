"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, Star } from "lucide-react";
import { Product } from "@/types";
import { formatMoney, calculateDiscount } from "@/lib/format";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";

  const discountPercent = calculateDiscount(product.priceInCents, product.compareAtPriceInCents);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden">
      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-slate-100 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.isFeatured && (
            <span className="bg-indigo-600 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-sm">
              Featured
            </span>
          )}
          {discountPercent && (
            <span className="bg-rose-500 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Stock Badge */}
        {product.stock <= 20 && product.stock > 0 && (
          <span className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur-sm text-white font-semibold text-[10px] px-2 py-0.5 rounded-md shadow-sm">
            Low Stock: {product.stock} left
          </span>
        )}
      </Link>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              {product.category?.name || "General"}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-[11px] font-semibold text-slate-700">4.9</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-slate-900 text-sm leading-snug hover:text-indigo-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 text-base">
              {formatMoney(product.priceInCents)}
            </span>
            {product.compareAtPriceInCents && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatMoney(product.compareAtPriceInCents)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              product.stock === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : added
                ? "bg-emerald-600 text-white scale-95"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
            title={product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline-block">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline-block">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
