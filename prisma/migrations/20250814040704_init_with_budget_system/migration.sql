-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('MASTER', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "public"."StaffType" AS ENUM ('QUALIFIED', 'UNQUALIFIED', 'ADMIN', 'CASUAL');

-- CreateEnum
CREATE TYPE "public"."ImportType" AS ENUM ('OCCUPANCY', 'STAFF_HOURS', 'CENTRES');

-- CreateEnum
CREATE TYPE "public"."DashboardPage" AS ENUM ('DASHBOARD', 'XERO', 'MARKETING', 'DATA_MANAGEMENT', 'ADMIN', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "public"."SyncFrequency" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_centre_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "centreId" TEXT NOT NULL,
    "canViewOccupancy" BOOLEAN NOT NULL DEFAULT true,
    "canEditOccupancy" BOOLEAN NOT NULL DEFAULT false,
    "canViewFinancials" BOOLEAN NOT NULL DEFAULT false,
    "canEditFinancials" BOOLEAN NOT NULL DEFAULT false,
    "canViewEnrollments" BOOLEAN NOT NULL DEFAULT true,
    "canEditEnrollments" BOOLEAN NOT NULL DEFAULT false,
    "canViewReports" BOOLEAN NOT NULL DEFAULT true,
    "canManageStaff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_centre_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."centres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "capacity" INTEGER,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "centres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."occupancy_data" (
    "id" TEXT NOT NULL,
    "centreId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "u2Count" INTEGER NOT NULL,
    "o2Count" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occupancy_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."staff_hours" (
    "id" TEXT NOT NULL,
    "centreId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "staffType" "public"."StaffType" NOT NULL,
    "hoursWorked" DOUBLE PRECISION NOT NULL,
    "hoursPaid" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."import_logs" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "importType" "public"."ImportType" NOT NULL,
    "recordsProcessed" INTEGER NOT NULL,
    "recordsSuccess" INTEGER NOT NULL,
    "recordsErrors" INTEGER NOT NULL,
    "errorDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_page_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "page" "public"."DashboardPage" NOT NULL,
    "canAccess" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_page_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."centre_budget_categories" (
    "id" TEXT NOT NULL,
    "centreId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "xeroAccountCode" TEXT,
    "xeroAccountName" TEXT,
    "monthlyBudget" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "centre_budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."actual_expenses" (
    "id" TEXT NOT NULL,
    "centreBudgetCategoryId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "xeroTransactionId" TEXT,
    "actualAmount" DECIMAL(10,2) NOT NULL,
    "xeroSyncDate" TIMESTAMP(3),
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actual_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."xero_config" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "xeroTenantId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "lastSyncDate" TIMESTAMP(3),
    "autoSyncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncFrequency" "public"."SyncFrequency" NOT NULL DEFAULT 'DAILY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xero_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_centre_permissions_userId_centreId_key" ON "public"."user_centre_permissions"("userId", "centreId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "public"."organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "centres_code_key" ON "public"."centres"("code");

-- CreateIndex
CREATE UNIQUE INDEX "occupancy_data_centreId_date_key" ON "public"."occupancy_data"("centreId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "staff_hours_centreId_weekStart_staffType_key" ON "public"."staff_hours"("centreId", "weekStart", "staffType");

-- CreateIndex
CREATE UNIQUE INDEX "user_page_permissions_userId_page_key" ON "public"."user_page_permissions"("userId", "page");

-- CreateIndex
CREATE UNIQUE INDEX "centre_budget_categories_centreId_categoryId_key" ON "public"."centre_budget_categories"("centreId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "actual_expenses_xeroTransactionId_key" ON "public"."actual_expenses"("xeroTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "actual_expenses_centreBudgetCategoryId_year_month_key" ON "public"."actual_expenses"("centreBudgetCategoryId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "xero_config_organizationId_key" ON "public"."xero_config"("organizationId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_centre_permissions" ADD CONSTRAINT "user_centre_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_centre_permissions" ADD CONSTRAINT "user_centre_permissions_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "public"."centres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."centres" ADD CONSTRAINT "centres_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."occupancy_data" ADD CONSTRAINT "occupancy_data_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "public"."centres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."staff_hours" ADD CONSTRAINT "staff_hours_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "public"."centres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_page_permissions" ADD CONSTRAINT "user_page_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."centre_budget_categories" ADD CONSTRAINT "centre_budget_categories_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "public"."centres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."centre_budget_categories" ADD CONSTRAINT "centre_budget_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."budget_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."actual_expenses" ADD CONSTRAINT "actual_expenses_centreBudgetCategoryId_fkey" FOREIGN KEY ("centreBudgetCategoryId") REFERENCES "public"."centre_budget_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."actual_expenses" ADD CONSTRAINT "actual_expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."budget_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."xero_config" ADD CONSTRAINT "xero_config_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
