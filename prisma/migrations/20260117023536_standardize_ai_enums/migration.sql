/*
  Warnings:

  - The `permissions` column on the `ai_configurations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AiPermissions" AS ENUM ('READ_ONLY', 'SUGGEST', 'WRITE');

-- AlterTable
ALTER TABLE "ai_configurations" DROP COLUMN "permissions",
ADD COLUMN     "permissions" "AiPermissions" NOT NULL DEFAULT 'READ_ONLY';

-- DropEnum
DROP TYPE "AIPermissions";
