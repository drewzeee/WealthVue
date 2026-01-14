/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `net_worth_snapshots` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "net_worth_snapshots_date_key";

-- DropIndex
DROP INDEX "net_worth_snapshots_userId_date_idx";

-- CreateIndex
CREATE UNIQUE INDEX "net_worth_snapshots_userId_date_key" ON "net_worth_snapshots"("userId", "date");
