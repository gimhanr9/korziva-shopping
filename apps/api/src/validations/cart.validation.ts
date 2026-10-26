import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  shippingAddress: z.object({
    fullName: z.string().min(2, "Full name is required"),
    street: z.string().min(3, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().min(3, "Postal code is required"),
    country: z.string().default("US"),
    phone: z.string().optional(),
  }),
  saveAddress: z.boolean().optional().default(false),
  paymentMethod: z.enum(["demo_card", "demo_instant"]).default("demo_card"),
  idempotencyKey: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
