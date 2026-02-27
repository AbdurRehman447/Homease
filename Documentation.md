# 🏠 HomEase: The Complete Project Master Guide

Welcome to the all-in-one guide for **HomEase**, a full-stack home services marketplace. This single document consolidates everything from setup and features to database design and deployment.

---

## 🎯 1. Project Overview
**HomEase** connects homeowners with verified professionals (plumbers, electricians, cleaners, etc.). It features role-based access for Customers, Providers, and Administrators.

### Key Capabilities:
*   **Customers**: Search by city/service, book appointments, track status, and leave reviews.
*   **Providers**: Register with a multi-step form, manage their service profile, and track earnings.
*   **Admins**: Full dashboard with analytics, user management, and provider approval workflows.

---

## 🛠️ 2. Technology Stack
| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, Prisma ORM, JWT Auth |
| **Database** | PostgreSQL |
| **Services** | Stripe (Payments), Cloudinary (Images), Nodemailer (Email) |

---

## 🚀 3. Quick Start (Local Setup)

### Prerequisites
*   **Node.js** (v16+) & **npm**
*   **PostgreSQL** (v14+) running locally

### Step-by-Step Installation
1.  **Clone & Install**:
    ```bash
    # Frontend
    cd homeease-frontend && npm install
    # Backend
    cd homeease-backend && npm install
    ```
2.  **Database Setup**:
    *   Create a database named `homeease_db` in PostgreSQL.
    *   Update `homeease-backend/.env` with your connection string:
        `DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/homeease_db?schema=public"`
3.  **Run Migrations & Seed**:
    ```bash
    cd homeease-backend
    npx prisma migrate dev
    npm run prisma:seed  # Seeds 100 providers + demo accounts
    ```
4.  **Launch**:
    *   Backend: `npm run dev` (Port 5000)
    *   Frontend: `npm run dev` (Port 5173)

---

## 🔑 4. Demo Credentials
*All demo accounts use password: **demo123***

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@homeease.com` | `admin123` |
| **Customer** | `umar.farooq@example.com` | `demo123` |
| **Provider** | `bisharat123@gmail.com` | `demo123` |

*(Note: There are 100+ providers available. See [provider_credentials.html](./provider_credentials.html) for the full list).*

---

## 📊 5. Database Schema
The system uses **10 primary tables**:
1.  `users`: Core authentication for Customers & Admins.
2.  `providers`: Detailed profiles for service professionals.
3.  `services`: Definitions of available categories (Plumbing, etc.).
4.  `provider_services`: Links providers to specific services with custom pricing.
5.  `bookings`: Records of service requests and statuses.
6.  `payments`: Transaction records with Stripe integration.
7.  `reviews`: Customer feedback and ratings.
8.  `notifications`: Alerts for all user roles.
9.  `cities`: Valid locations (Karachi, Lahore, Islamabad, etc.).
10. `settings`: Global platform configurations.

---

## 🚀 6. Deployment Summary
**Recommended Hosting**:
*   **Frontend**: Vercel (Fast, handles React routing easily).
*   **Backend & DB**: Railway or Render (Includes managed PostgreSQL).

**Deployment Steps**:
1. Push code to GitHub.
2. Link repo to hosting providers.
3. Set environment variables (Stripe, Cloudinary, DATABASE_URL).
4. Run `npx prisma migrate deploy` in production.

---

## 💡 7. Useful Commands
| Task | Command |
| :--- | :--- |
| **Database GUI** | `npx prisma studio` |
| **Reset DB** | `npx prisma migrate reset` |
| **Build Frontend** | `npm run build` |
| **Backend Health** | `http://localhost:5000/health` |

---
**HomEase Development Team • 2026**
