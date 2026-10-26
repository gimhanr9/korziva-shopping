"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";

export interface CartItemData {
  id: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  unitPriceInCents: number;
  quantity: number;
  lineTotalInCents: number;
  stockAvailable: number;
  isOutOfStock: boolean;
  imageUrl: string;
  categoryName?: string;
}

interface CartDetails {
  cartId: string;
  items: CartItemData[];
  itemCount: number;
  subtotalInCents: number;
  shippingInCents: number;
  taxInCents: number;
  totalInCents: number;
}

interface CartContextType {
  cart: CartDetails | null;
  loading: boolean;
  itemCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const res = await apiClient<CartDetails>("/cart");
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    try {
      const res = await apiClient<CartDetails>("/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      });

      if (res.success && res.data) {
        setCart(res.data);
        return { success: true };
      }
      return {
        success: false,
        error: res.error?.message || "Failed to add product to cart",
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await apiClient<CartDetails>(`/cart/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await apiClient<CartDetails>(`/cart/items/${itemId}`, {
        method: "DELETE",
      });
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await apiClient<CartDetails>("/cart", {
        method: "DELETE",
      });
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const itemCount = cart?.itemCount ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
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
