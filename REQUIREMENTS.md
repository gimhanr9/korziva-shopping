# Build ShopFlow - Full-Stack E-commerce Platform

Act as a senior full-stack engineer. Build ShopFlow, a polished, production-minded e-commerce web application for small businesses. This is a portfolio project intended to demonstrate professional frontend, backend, database, and API development skills.

The application must be functional end to end, not just a collection of static UI screens.

## 1. Required architecture

Use a monorepo with this structure:

- `apps/web`: Next.js App Router, React, TypeScript, Tailwind CSS.
- `apps/api`: Node.js, Express.js, TypeScript, REST API.
- Database: PostgreSQL.
- ORM: Prisma, managed exclusively by the backend.
- Authentication: secure server-managed sessions or a well-designed access-token and refresh-token flow.
- Validation: Zod or an equivalent TypeScript validation library.
- Testing: appropriate unit and API integration tests.

Use npm workspaces to manage the frontend and backend from the repository root.

The frontend must communicate with the Express API over HTTP. Do not implement the business API using Next.js route handlers or Server Actions. All business operations must go through the Express backend.

Keep database credentials and secrets exclusively on the server.

## 2. Customer-facing storefront

Build a modern, responsive storefront with:

- Home page featuring a hero section, featured products, categories and promotions.
- Product listing page with search, category filters, sorting and pagination.
- Product detail page with images, description, price, stock availability and quantity selection.
- Shopping cart with add, remove, update quantity and subtotal calculations.
- Persistent cart for signed-in customers.
- Checkout form with customer details, shipping address and order summary.
- Order confirmation page and order history.
- Customer profile and account settings.

Include realistic product images, useful loading states, empty states, validation messages and error handling.

## 3. Authentication and authorization

Implement:

- Customer registration and login.
- Secure password hashing using Argon2id or bcrypt.
- Logout and session/token expiration handling.
- Protected customer routes and order access.
- Admin-only authorization for administrative operations.
- Secure handling of cookies, CORS, secrets and authentication credentials.

Never trust a role or user ID supplied by the client. Verify authorization on the backend for every protected operation.

## 4. Express REST API

Create a well-organized API with controllers, routes, services, middleware, validation schemas and error handling.

Include endpoints for:

- Authentication and current user profile.
- Products, categories, search, filtering and pagination.
- Cart management.
- Checkout and order creation.
- Customer order history and order details.
- Admin product and category CRUD.
- Admin inventory management.
- Admin order management and status updates.
- Admin dashboard metrics.

Use consistent HTTP status codes and a predictable JSON response format. Add API documentation using OpenAPI/Swagger.

## 5. Database and business rules

Design a normalized Prisma schema for users, products, categories, product images, carts, cart items, orders, order items, addresses and any supporting models required.

Implement migrations and a seed script containing realistic sample products and categories.

Important rules:

- Store monetary amounts using an appropriate fixed-precision database type or integer minor units, not floating-point arithmetic.
- Validate stock and prices on the server.
- Calculate order totals on the backend using trusted database values.
- Use database transactions when creating orders and adjusting inventory.
- Prevent overselling when concurrent orders target the same stock.
- Preserve order item names and prices as historical snapshots.
- Enforce ownership checks so customers cannot access other customers' orders.
- Use appropriate database indexes and constraints.

## 6. Checkout and payment

Implement a complete demo checkout using a simulated payment provider. Clearly label it as demo checkout.

Do not collect real card numbers or claim a real payment has been processed. Structure the payment integration so a real provider can be added later.

Make order creation idempotent where appropriate and ensure inventory changes remain consistent if a checkout fails.

## 7. Admin dashboard

Build a separate, protected admin interface featuring:

- Sales and order summary cards.
- Recent orders and order status management.
- Product creation, editing and deletion.
- Stock management and low-stock indicators.
- Category management.
- Customer and order views.
- Date-based sales summaries.

All metrics must come from the API and database, not hardcoded values.

## 8. UI and design

Use a clean, premium, contemporary design suitable for a real online store.

Include consistent typography, spacing, responsive layouts, accessible form controls, reusable components, product cards, tables, badges, dialogs, notifications and confirmation states.

Ensure the customer storefront and admin dashboard are visually consistent but have distinct navigation and workflows.

## 9. Security and quality

- Validate and sanitize all inputs on the server.
- Apply appropriate rate limits to authentication endpoints.
- Configure CORS and security headers carefully.
- Prevent unauthorized access to admin functionality.
- Avoid exposing stack traces, secrets or sensitive database details.
- Use environment variables and provide `.env.example` files without real secrets.
- Add unit tests for business logic and integration tests for important API workflows.
- Include tests for authentication, permissions, checkout validation, order creation and inventory handling.

## 10. Developer experience and deployment

Provide:

- Root npm scripts to install, run, lint, type-check and test both apps.
- Prisma migration and database seeding commands.
- `.env.example` files.
- A useful README with setup, architecture, API endpoints, testing and deployment instructions.
- A health-check endpoint for the backend.
- Production build instructions and appropriate configuration for deploying the frontend and backend as separate services.

Do not commit secrets or generated build artifacts.

## 11. Implementation workflow

Work in stages rather than attempting everything at once.

- **Stage 1**: Inspect the repository, outline the architecture, establish npm workspaces, and scaffold both applications.
- **Stage 2**: Configure PostgreSQL and Prisma, design the schema, run migrations, and seed sample data.
- **Stage 3**: Implement authentication, authorization, product APIs and customer-facing product pages.
- **Stage 4**: Implement cart, checkout, orders and transactional inventory management.
- **Stage 5**: Build the admin dashboard and administrative APIs.
- **Stage 6**: Add tests, documentation, security checks and production build configuration.

After each stage:
- Run the relevant checks.
- Fix errors before proceeding.
- Report what was implemented and which commands passed.
- Identify any incomplete functionality honestly.

Do not mark a feature complete merely because its UI exists. Verify the actual API and database behavior.

Begin with Stage 1. First inspect the existing repository and present a concise implementation plan. Then scaffold the project and verify that both applications start successfully.
