import { PrismaClient, Role, OrderStatus, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data in reverse order of relationships
  console.log("🧹 Clearing old records...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  console.log("👤 Creating seed users...");
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const customerPasswordHash = await bcrypt.hash("Customer123!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@shopflow.dev",
      passwordHash: adminPasswordHash,
      firstName: "Alex",
      lastName: "Administrator",
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@shopflow.dev",
      passwordHash: customerPasswordHash,
      firstName: "Dineth",
      lastName: "Customer",
      role: Role.CUSTOMER,
      addresses: {
        create: [
          {
            fullName: "Dineth Customer",
            street: "742 Evergreen Terrace",
            city: "Springfield",
            state: "OR",
            postalCode: "97477",
            country: "US",
            phone: "+1 (555) 234-5678",
            isDefault: true,
          },
          {
            fullName: "Dineth Work Office",
            street: "100 Market St, Suite 400",
            city: "San Francisco",
            state: "CA",
            postalCode: "94105",
            country: "US",
            phone: "+1 (555) 876-5432",
            isDefault: false,
          },
        ],
      },
    },
  });

  console.log(`✅ Created Admin: ${admin.email}`);
  console.log(`✅ Created Customer: ${customer.email}`);

  // 2. Seed Categories
  console.log("📁 Creating categories...");
  const audioCategory = await prisma.category.create({
    data: {
      name: "Audio & Acoustics",
      slug: "audio-acoustics",
      description: "Premium noise-canceling headphones, studio monitors, and wireless earbuds.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      displayOrder: 1,
    },
  });

  const workstationCategory = await prisma.category.create({
    data: {
      name: "Workstation & Tech",
      slug: "workstation-tech",
      description: "Ergonomic peripherals, mechanical keyboards, and 4K displays built for productivity.",
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
      displayOrder: 2,
    },
  });

  const lifestyleCategory = await prisma.category.create({
    data: {
      name: "Lifestyle & Carry",
      slug: "lifestyle-carry",
      description: "Minimalist backpacks, stainless water bottles, and desk accessories for modern creators.",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      displayOrder: 3,
    },
  });

  const smartHomeCategory = await prisma.category.create({
    data: {
      name: "Smart Home",
      slug: "smart-home",
      description: "Ambient lighting, smart clocks, and IoT essentials to enhance your living space.",
      imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
      displayOrder: 4,
    },
  });

  // 3. Seed Products
  console.log("📦 Creating products...");
  const productsData = [
    {
      name: "AeroTune Spatial ANC Headphones",
      slug: "aerotune-spatial-anc-headphones",
      description:
        "Engineered for audiophiles with 40mm beryllium drivers, active hybrid noise cancellation up to 42dB, transparency mode, and 38-hour battery longevity.",
      priceInCents: 24900, // $249.00
      compareAtPriceInCents: 29900, // $299.00
      stock: 45,
      sku: "SF-AUD-001",
      isFeatured: true,
      categoryId: audioCategory.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
          altText: "AeroTune Headphones in Matte Onyx",
          isPrimary: true,
          displayOrder: 1,
        },
        {
          url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
          altText: "AeroTune Headband and Earcups Angle",
          isPrimary: false,
          displayOrder: 2,
        },
      ],
    },
    {
      name: "PulsePods Pro Wireless Earbuds",
      slug: "pulsepods-pro-wireless-earbuds",
      description:
        "Featherlight true wireless earbuds featuring IPX7 water resistance, wireless charging case, crystal-clear 4-mic beamforming calls, and low-latency gaming mode.",
      priceInCents: 12900, // $129.00
      compareAtPriceInCents: 15900,
      stock: 75,
      sku: "SF-AUD-002",
      isFeatured: true,
      categoryId: audioCategory.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
          altText: "PulsePods Pro Earbuds in Charging Case",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      name: "Chronos Mechanical Studio Keyboard",
      slug: "chronos-mechanical-studio-keyboard",
      description:
        "Hot-swappable 75% mechanical keyboard housed in a CNC aluminum body. Features custom lubed tactile switches, south-facing RGB, and sound-dampening silicone foam.",
      priceInCents: 17900, // $179.00
      compareAtPriceInCents: 21900,
      stock: 30,
      sku: "SF-WKS-001",
      isFeatured: true,
      categoryId: workstationCategory.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
          altText: "Chronos Mechanical Keyboard with Custom Keycaps",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      name: "Precision Master Wireless Mouse",
      slug: "precision-master-wireless-mouse",
      description:
        "Ergonomically contoured for all-day comfort. Features an electromagnetic MagSpeed scroll wheel, multi-device Bluetooth switching, and a 4,000 DPI Darkfield sensor.",
      priceInCents: 8900, // $89.00
      compareAtPriceInCents: 9900,
      stock: 60,
      sku: "SF-WKS-002",
      isFeatured: false,
      categoryId: workstationCategory.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80",
          altText: "Precision Master Wireless Mouse",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      name: "UltraView 27-inch 4K Studio Monitor",
      slug: "ultraview-27-inch-4k-studio-monitor",
      description:
        "Crisp 4K IPS display covering 99% DCI-P3 color gamut with 90W USB-C single-cable power delivery and adjustable height/tilt/pivot aluminum stand.",
      priceInCents: 54900, // $549.00
      compareAtPriceInCents: 59900,
      stock: 15,
      sku: "SF-WKS-003",
      isFeatured: true,
      categoryId: workstationCategory.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
          altText: "UltraView 4K Studio Monitor on Desk",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      name: "Nomad Commuter Waterproof Backpack 24L",
      slug: "nomad-commuter-waterproof-backpack-24l",
      description:
        "Crafted from weatherproof recycled Cordura ballistic fabric. Features a dedicated 16-inch padded laptop sleeve, quick-access passport pocket, and luggage pass-through.",
      priceInCents: 13900, // $139.00
      compareAtPriceInCents: 16900,
      stock: 40,
      sku: "SF-LST-001",
      isFeatured: true,
      categoryId: lifestyleCategory.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
          altText: "Nomad Commuter Waterproof Backpack",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      name: "HydroPure Vacuum Thermal Bottle 750ml",
      slug: "hydropure-vacuum-thermal-bottle-750ml",
      description:
        "Double-wall food-grade 18/8 stainless steel keeps drinks icy cold for 24 hours or piping hot for 12 hours. BPA-free leakproof lid with copper insulation lining.",
      priceInCents: 3400, // $34.00
      compareAtPriceInCents: null,
      stock: 120,
      sku: "SF-LST-002",
      isFeatured: false,
      categoryId: lifestyleCategory.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
          altText: "HydroPure Stainless Thermal Bottle in Slate Gray",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      name: "Lumina Glow Ambient Smart Desk Lamp",
      slug: "lumina-glow-ambient-smart-desk-lamp",
      description:
        "Circadian rhythm auto-tuning smart lamp with color temperature range from 2200K to 6500K. Works with Matter, HomeKit, and Google Home with touch dimmer slide.",
      priceInCents: 7900, // $79.00
      compareAtPriceInCents: 9900,
      stock: 50,
      sku: "SF-SMH-001",
      isFeatured: true,
      categoryId: smartHomeCategory.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
          altText: "Lumina Glow Desk Lamp with warm glow",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      name: "Aura Smart Air Quality Monitor & Purifier",
      slug: "aura-smart-air-quality-monitor-purifier",
      description:
        "Real-time PM2.5, VOC, and CO2 monitoring with true HEPA H13 filtration. Quiet sleep mode at 21dB and mobile app notifications for indoor air health.",
      priceInCents: 19900, // $199.00
      compareAtPriceInCents: 23900,
      stock: 25,
      sku: "SF-SMH-002",
      isFeatured: false,
      categoryId: smartHomeCategory.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
          altText: "Aura Smart Air Purifier Unit",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const { images, ...productInfo } = p;
    const createdProduct = await prisma.product.create({
      data: {
        ...productInfo,
        images: {
          create: images,
        },
      },
    });
    createdProducts.push(createdProduct);
  }
  console.log(`✅ Seeded ${createdProducts.length} sample products with images`);

  // 4. Seed an Initial Customer Cart
  console.log("🛒 Creating active cart for customer...");
  await prisma.cart.create({
    data: {
      userId: customer.id,
      items: {
        create: [
          {
            productId: createdProducts[0].id, // AeroTune
            quantity: 1,
          },
          {
            productId: createdProducts[2].id, // Chronos Keyboard
            quantity: 1,
          },
        ],
      },
    },
  });

  // 5. Seed Historical Demo Orders
  console.log("📑 Creating demo orders for analytics and order history...");
  const customerAddress = await prisma.address.findFirst({
    where: { userId: customer.id },
  });

  const addressSnapshot = customerAddress
    ? {
        fullName: customerAddress.fullName,
        street: customerAddress.street,
        city: customerAddress.city,
        state: customerAddress.state,
        postalCode: customerAddress.postalCode,
        country: customerAddress.country,
        phone: customerAddress.phone,
      }
    : {
        fullName: "Dineth Customer",
        street: "742 Evergreen Terrace",
        city: "Springfield",
        state: "OR",
        postalCode: "97477",
        country: "US",
        phone: "+1 (555) 234-5678",
      };

  // Order 1: Completed / Delivered
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "SF-ORD-20261020-001",
      userId: customer.id,
      customerEmail: customer.email,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerPhone: "+1 (555) 234-5678",
      shippingAddressSnapshot: addressSnapshot,
      subtotalInCents: 24900,
      shippingInCents: 0, // Free shipping
      taxInCents: 1992, // 8% tax
      totalInCents: 26892,
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentReference: "sim_pay_892374619",
      paymentProvider: "simulated",
      createdAt: new Date("2026-10-20T14:30:00Z"),
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            productName: createdProducts[0].name,
            productSku: createdProducts[0].sku,
            unitPriceInCents: createdProducts[0].priceInCents,
            quantity: 1,
            totalPriceInCents: createdProducts[0].priceInCents,
            productImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
          },
        ],
      },
    },
  });

  // Order 2: Processing / Paid
  const order2 = await prisma.order.create({
    data: {
      orderNumber: "SF-ORD-20261024-002",
      userId: customer.id,
      customerEmail: customer.email,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerPhone: "+1 (555) 234-5678",
      shippingAddressSnapshot: addressSnapshot,
      subtotalInCents: 17900 + 3400,
      shippingInCents: 999,
      taxInCents: 1704,
      totalInCents: 24003,
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentReference: "sim_pay_908123455",
      paymentProvider: "simulated",
      createdAt: new Date("2026-10-24T09:15:00Z"),
      items: {
        create: [
          {
            productId: createdProducts[2].id, // Chronos Keyboard
            productName: createdProducts[2].name,
            productSku: createdProducts[2].sku,
            unitPriceInCents: createdProducts[2].priceInCents,
            quantity: 1,
            totalPriceInCents: createdProducts[2].priceInCents,
            productImageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
          },
          {
            productId: createdProducts[6].id, // HydroPure Bottle
            productName: createdProducts[6].name,
            productSku: createdProducts[6].sku,
            unitPriceInCents: createdProducts[6].priceInCents,
            quantity: 1,
            totalPriceInCents: createdProducts[6].priceInCents,
            productImageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded historical orders: ${order1.orderNumber}, ${order2.orderNumber}`);

  console.log("\n🎉 Database seed completed successfully!");
  console.log("-----------------------------------------");
  console.log("Demo Credentials:");
  console.log("Admin:    admin@shopflow.dev    / Admin123!");
  console.log("Customer: customer@shopflow.dev / Customer123!");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
