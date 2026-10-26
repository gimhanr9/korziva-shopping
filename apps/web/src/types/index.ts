export type Role = "CUSTOMER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt?: string;
  addresses?: Address[];
  _count?: {
    orders: number;
  };
}

export interface Address {
  id: string;
  userId?: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  _count?: {
    products: number;
  };
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceInCents: number;
  compareAtPriceInCents?: number | null;
  stock: number;
  sku: string;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
