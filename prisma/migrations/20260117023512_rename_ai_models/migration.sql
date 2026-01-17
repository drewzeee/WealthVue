/*
  Warnings:

  - The `activeProvider` column on the `ai_configurations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `provider` column on the `ai_messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('OPENAI', 'ANTHROPIC', 'GEMINI', 'OLLAMA');

-- AlterTable
ALTER TABLE "ai_configurations" DROP COLUMN "activeProvider",
ADD COLUMN     "activeProvider" "AiProvider" NOT NULL DEFAULT 'OPENAI';

-- AlterTable
ALTER TABLE "ai_messages" DROP COLUMN "provider",
ADD COLUMN     "provider" "AiProvider";

-- DropEnum
DROP TYPE "AIProvider";
