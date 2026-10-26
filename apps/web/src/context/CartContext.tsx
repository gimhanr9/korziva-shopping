"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types";

export interface LocalCartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: LocalCartItem[];
  itemCount: number;
  subtotalInCents: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shopflow_local_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("shopflow_local_cart", JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(quantity, item.product.stock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalInCents = items.reduce(
    (sum, item) => sum + item.product.priceInCents * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotalInCents,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
