-- ==========================================
-- PostgreSQL Database Setup Script
-- Project: Samishti Schemes
-- ==========================================

-- 1. Create the Database (Run this separately if DB doesn't exist)
-- CREATE DATABASE samishti_schemes;
-- \c samishti_schemes;

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR,
    "startDate" DATE,
    "endDate" DATE,
    status VARCHAR DEFAULT 'upcoming',
    "targetType" VARCHAR DEFAULT 'total_sales',
    "selectedTargetItem" VARCHAR,
    "totalBudget" NUMERIC(12, 2),
    "maxQualifiers" INTEGER,
    "individualTarget" NUMERIC(12, 2),
    "rewardRate" NUMERIC(5, 2),
    "payoutPerPerson" NUMERIC(12, 2),
    "recipientType" VARCHAR DEFAULT 'customer',
    "regionFilter" VARCHAR DEFAULT 'all',
    region VARCHAR,
    category VARCHAR,
    targets INTEGER DEFAULT 0,
    revenue VARCHAR,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipients (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    "currentTO" NUMERIC(15, 2),
    "avgDaily" NUMERIC(12, 2),
    category VARCHAR,
    type VARCHAR,
    region VARCHAR,
    "paymentStatus" VARCHAR,
    products TEXT,
    "recipientType" VARCHAR DEFAULT 'customer'
);

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    "displayName" VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    "emailAlerts" BOOLEAN DEFAULT true,
    "weeklyReports" BOOLEAN DEFAULT true,
    "systemUpdates" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 3. Clear existing data
TRUNCATE TABLE schemes, recipients, settings RESTART IDENTITY CASCADE;

-- 4. Insert Data (Schemes)
INSERT INTO schemes (name, description, "startDate", "endDate", status, "targetType", "totalBudget", "maxQualifiers", "individualTarget", "rewardRate", "payoutPerPerson", "recipientType", "regionFilter", region, category, targets, revenue) VALUES
('Diwali Bonanza 2026', 'Festival mega-push', '2026-01-01', '2026-03-31', 'active', 'TOTAL SALES', 120000, 120, 50000, 5, 2500, 'customer', 'all', 'All Regions', 'All', 87, '₹45L'),
('Insecticide Push Q1', 'Drive adoption of XYZ Insecticide', '2026-01-15', '2026-04-15', 'active', 'PRODUCT QTY', 80000, 60, 200, 10, 500, 'customer', 'north', 'North', 'Insecticides', 42, '₹18L'),
('Summer Sale 2025', 'Summer clearance for insecticides', '2025-04-01', '2025-06-30', 'expired', 'PRODUCT QTY', 50000, 85, 30000, 3, 900, 'customer', 'west', 'West', 'Insecticides', 85, '₹32L'),
('Monsoon Dhamaka 2026', 'Monsoon season special', '2026-06-01', '2026-09-30', 'upcoming', 'PRODUCT QTY', 150000, 150, 40000, 6, 2400, 'distributor', 'all', 'All Regions', 'Herbicides', 0, '-');

-- 5. Insert Data (Recipients)
INSERT INTO recipients (name, "currentTO", "avgDaily", category, type, region, "paymentStatus", "recipientType") VALUES
('Rajesh Agro Traders', 62000, 2100, 'Insecticides', 'Dealer', 'North', 'Completed', 'customer'),
('Kumar Fertilizers', 48000, 1600, 'Fertilizers', 'Dealer', 'North', 'Pending', 'customer'),
('Patel Farm Supplies', 42000, 1400, 'Herbicides', 'Dealer', 'South', 'Completed', 'customer'),
('National Agro Distributors', 450000, 15000, 'All', 'Distributor', 'North', 'Completed', 'distributor'),
('Amit Kumar — Area Sales Mgr', 125000, 4200, 'All', 'Sales Executive', 'North', 'Completed', 'sales executive');

-- 6. Insert Data (Settings)
INSERT INTO settings ("displayName", email, "emailAlerts", "weeklyReports", "systemUpdates") VALUES
('Executive', 'executive@samishti.com', true, true, true);
