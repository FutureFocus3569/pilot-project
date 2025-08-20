-- Create ENUM types first
CREATE TYPE "UserRole" AS ENUM ('MASTER', 'ADMIN', 'USER');
CREATE TYPE "StaffType" AS ENUM ('EARLY_CHILDHOOD_TEACHER', 'ASSISTANT', 'ADMIN', 'COOK', 'CLEANER', 'OTHER');
CREATE TYPE "ImportType" AS ENUM ('OCCUPANCY', 'STAFF_HOURS', 'FINANCIAL');

-- Create tables
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "centres" (
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

CREATE TABLE "occupancy_data" (
    "id" TEXT NOT NULL,
    "centreId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "u2Count" INTEGER NOT NULL DEFAULT 0,
    "o2Count" INTEGER NOT NULL DEFAULT 0,
    "totalOccupancy" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occupancy_data_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "staff_hours" (
    "id" TEXT NOT NULL,
    "centreId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "staffType" "StaffType" NOT NULL,
    "hoursWorked" DOUBLE PRECISION NOT NULL,
    "staffName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_hours_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "import_logs" (
    "id" TEXT NOT NULL,
    "type" "ImportType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "recordsImported" INTEGER NOT NULL,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorLog" JSONB,
    "importedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_logs_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "centres_code_key" ON "centres"("code");
CREATE UNIQUE INDEX "occupancy_data_centreId_date_key" ON "occupancy_data"("centreId", "date");

-- Add foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "centres" ADD CONSTRAINT "centres_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "occupancy_data" ADD CONSTRAINT "occupancy_data_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "centres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_hours" ADD CONSTRAINT "staff_hours_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "centres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "import_logs" ADD CONSTRAINT "import_logs_importedBy_fkey" FOREIGN KEY ("importedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
