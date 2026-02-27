-- ================================================================
-- HomEase PostgreSQL Database Setup Script
-- ================================================================
-- This script creates the complete database schema and sample data
-- for the HomEase service booking application.
-- 
-- Database: PostgreSQL 14+
-- ORM: Prisma
-- Created: January 2026
-- ================================================================

-- ================================================================
-- STEP 1: CREATE DATABASE (Run this separately if needed)
-- ================================================================
-- CREATE DATABASE homeease_db;
-- \c homeease_db;

-- ================================================================
-- STEP 2: CREATE ENUMS
-- ================================================================

CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN');

CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');

CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

CREATE TYPE "ProviderStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ACTIVE');

-- ================================================================
-- STEP 3: CREATE TABLES
-- ================================================================

-- Table: users (Customers and Admins)
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "avatar" TEXT,
    "address" TEXT,
    "city" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Table: providers (Service Providers)
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "bio" TEXT,
    "experience" INTEGER,
    "avatar" TEXT,
    "coverImage" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "ProviderStatus" NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseTime" TEXT,
    "joinedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationToken" TEXT,
    "documents" JSONB,
    "availability" JSONB,
    "bankDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- Table: services (Service Categories)
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "duration" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- Table: provider_services (Junction Table)
CREATE TABLE "provider_services" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_services_pkey" PRIMARY KEY ("id")
);

-- Table: bookings (Service Bookings)
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "price" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "coordinates" JSONB,
    "notes" TEXT,
    "jobDescription" TEXT,
    "cancellationReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- Table: payments (Payment Records)
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "providerAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Table: reviews (Customer Reviews)
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "response" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- Table: notifications (User Notifications)
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "providerId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Table: cities (Service Locations)
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Pakistan',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "areas" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- Table: settings (Platform Settings)
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- ================================================================
-- STEP 4: CREATE INDEXES
-- ================================================================

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE UNIQUE INDEX "providers_email_key" ON "providers"("email");

CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

CREATE UNIQUE INDEX "provider_services_providerId_serviceId_key" ON "provider_services"("providerId", "serviceId");

CREATE UNIQUE INDEX "bookings_bookingNumber_key" ON "bookings"("bookingNumber");

CREATE UNIQUE INDEX "payments_bookingId_key" ON "payments"("bookingId");

CREATE UNIQUE INDEX "reviews_bookingId_key" ON "reviews"("bookingId");

CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- ================================================================
-- STEP 5: CREATE FOREIGN KEYS
-- ================================================================

ALTER TABLE "provider_services" ADD CONSTRAINT "provider_services_providerId_fkey" 
    FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_services" ADD CONSTRAINT "provider_services_serviceId_fkey" 
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_providerId_fkey" 
    FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceId_fkey" 
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" 
    FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" 
    FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_providerId_fkey" 
    FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_providerId_fkey" 
    FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ================================================================
-- STEP 6: INSERT SAMPLE DATA
-- ================================================================

-- Insert Cities
INSERT INTO "cities" ("id", "name", "state", "country", "isActive", "areas", "createdAt", "updatedAt") VALUES
('city-1', 'Karachi', 'Sindh', 'Pakistan', true, '["Gulshan-e-Iqbal", "DHA", "Clifton", "North Nazimabad", "Malir"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city-2', 'Lahore', 'Punjab', 'Pakistan', true, '["DHA Phase 5", "Gulberg", "Model Town", "Johar Town", "Cavalry Ground"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city-3', 'Islamabad', 'ICT', 'Pakistan', true, '["F-10 Markaz", "G-11", "Blue Area", "I-8", "Bahria Town"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('city-4', 'Rawalpindi', 'Punjab', 'Pakistan', true, '["Bahria Town", "Saddar", "Satellite Town", "Chaklala"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Services
INSERT INTO "services" ("id", "name", "category", "description", "icon", "basePrice", "duration", "isPopular", "isActive", "createdAt", "updatedAt") VALUES
('service-1', 'House Cleaning', 'Cleaning', 'Professional home cleaning services', '🧹', 2500, '2-3 hours', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('service-2', 'Plumbing', 'Home Repair', 'Expert plumbing repair and installation', '🔧', 3000, '1-2 hours', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('service-3', 'Electrical Work', 'Home Repair', 'Licensed electrical services', '⚡', 3200, '1-3 hours', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('service-4', 'Painting', 'Home Improvement', 'Interior and exterior painting', '🎨', 4500, '4-8 hours', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('service-5', 'Pest Control', 'Cleaning', 'Safe and effective pest elimination', '🐛', 2800, '1-2 hours', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('service-6', 'AC Repair', 'Home Repair', 'Air conditioning maintenance and repair', '❄️', 3500, '2-4 hours', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('service-7', 'Carpentry', 'Home Improvement', 'Custom woodwork and furniture repair', '🪚', 3800, '2-5 hours', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('service-8', 'Lawn Care', 'Outdoor', 'Lawn mowing and garden maintenance', '🌱', 2600, '1-2 hours', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('service-9', 'Appliance Repair', 'Home Repair', 'Fix all types of home appliances', '🔨', 2900, '1-3 hours', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('service-10', 'Interior Design', 'Home Improvement', 'Professional interior design consultation', '🏠', 5000, '2-4 hours', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Users (Password hash for "demo123": $2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
-- Note: Use bcrypt to generate actual hashed passwords in production
INSERT INTO "users" ("id", "name", "email", "password", "phone", "role", "avatar", "address", "city", "isActive", "isVerified", "createdAt", "updatedAt") VALUES
('user-1', 'Umar Farooq', 'umar.farooq@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+92-300-1234567', 'CUSTOMER', 'https://i.pravatar.cc/300?img=12', 'Block 15, Gulshan-e-Iqbal', 'Karachi', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-2', 'Fahad Noor', 'fahad.noor@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+92-301-2345678', 'CUSTOMER', 'https://i.pravatar.cc/300?img=13', 'DHA Phase 5', 'Lahore', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-3', 'Admin User', 'admin@homeease.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+92-302-9999999', 'ADMIN', 'https://i.pravatar.cc/300?img=50', NULL, NULL, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Providers
INSERT INTO "providers" ("id", "name", "email", "password", "phone", "bio", "experience", "avatar", "address", "city", "location", "status", "isVerified", "isActive", "rating", "totalReviews", "totalBookings", "completionRate", "responseTime", "joinedDate", "createdAt", "updatedAt") VALUES
('provider-1', 'Ahmed Khan', 'ahmed.khan@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+92-311-1111111', 'Professional cleaner with 5 years of experience', 5, 'https://i.pravatar.cc/300?img=1', 'Block 7, Gulshan-e-Iqbal', 'Karachi', 'Gulshan-e-Iqbal', 'APPROVED', true, true, 4.8, 127, 145, 98.5, '2-4 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('provider-2', 'Muhammad Ali', 'muhammad.ali@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+92-312-2222222', 'Expert plumber specializing in modern fixtures', 8, 'https://i.pravatar.cc/300?img=2', 'DHA Phase 5', 'Lahore', 'DHA', 'APPROVED', true, true, 4.9, 203, 220, 99.1, '1-3 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('provider-3', 'Hassan Raza', 'hassan.raza@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+92-313-3333333', 'Licensed electrician with commercial experience', 6, 'https://i.pravatar.cc/300?img=3', 'F-10 Markaz', 'Islamabad', 'F-10', 'APPROVED', true, true, 4.7, 98, 110, 97.3, '2-5 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Provider-Service Relationships
INSERT INTO "provider_services" ("id", "providerId", "serviceId", "price", "description", "isActive", "createdAt", "updatedAt") VALUES
('ps-1', 'provider-1', 'service-1', 2500, 'Deep cleaning with eco-friendly products', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ps-2', 'provider-2', 'service-2', 3000, 'All types of plumbing repairs and installations', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ps-3', 'provider-3', 'service-3', 3200, 'Residential and commercial electrical services', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert System Settings
INSERT INTO "settings" ("id", "key", "value", "description", "createdAt", "updatedAt") VALUES
('setting-1', 'platform_fee_percentage', '10', 'Platform fee percentage (10%)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('setting-2', 'min_booking_amount', '500', 'Minimum booking amount in PKR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('setting-3', 'cancellation_window_hours', '24', 'Hours before booking can be cancelled without penalty', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ================================================================
-- STEP 7: VERIFICATION QUERIES
-- ================================================================

-- Verify table creation and data
SELECT 'Cities' as table_name, COUNT(*) as row_count FROM cities
UNION ALL
SELECT 'Services', COUNT(*) FROM services
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Providers', COUNT(*) FROM providers
UNION ALL
SELECT 'Provider Services', COUNT(*) FROM provider_services
UNION ALL
SELECT 'Settings', COUNT(*) FROM settings;

-- ================================================================
-- SETUP COMPLETE!
-- ================================================================
-- Database schema and sample data have been created successfully.
-- 
-- Demo Credentials:
-- - Customer: umar.farooq@example.com / demo123
-- - Provider: ahmed.khan@example.com / demo123
-- - Admin: admin@homeease.com / demo123
-- 
-- Next Steps:
-- 1. Update your .env file with the DATABASE_URL
-- 2. Connect your application to the database
-- 3. Start building!
-- ================================================================
