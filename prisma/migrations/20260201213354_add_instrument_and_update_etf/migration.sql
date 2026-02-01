/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Etf` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Etf` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Etf` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Etf` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Instrument" (
    "isin" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameSource" TEXT NOT NULL,
    "classification" TEXT,
    "nameConflict" BOOLEAN NOT NULL DEFAULT false,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL
);

-- Migrate existing ETF data to Instrument table
-- For each unique ISIN in Etf, create an Instrument record with name from existing data
INSERT INTO "Instrument" ("isin", "name", "nameSource", "firstSeenAt", "lastSeenAt")
SELECT DISTINCT
    "isin",
    COALESCE("name", 'Unknown ETF'),  -- Use existing name or fallback
    'FALLBACK',  -- Mark as FALLBACK source
    COALESCE("createdAt", CURRENT_TIMESTAMP),
    COALESCE("updatedAt", CURRENT_TIMESTAMP)
FROM "Etf"
WHERE "isin" IS NOT NULL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Etf" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isin" TEXT NOT NULL,
    "exchangeId" TEXT NOT NULL,
    "ticker" TEXT,
    "tradingCurrency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sourceSystem" TEXT NOT NULL DEFAULT 'FALLBACK',
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Etf_isin_fkey" FOREIGN KEY ("isin") REFERENCES "Instrument" ("isin") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Etf_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Etf" ("exchangeId", "id", "isin", "ticker") SELECT "exchangeId", "id", "isin", "ticker" FROM "Etf";
DROP TABLE "Etf";
ALTER TABLE "new_Etf" RENAME TO "Etf";
CREATE INDEX "Etf_isin_idx" ON "Etf"("isin");
CREATE INDEX "Etf_ticker_idx" ON "Etf"("ticker");
CREATE INDEX "Etf_status_idx" ON "Etf"("status");
CREATE INDEX "Etf_sourceSystem_idx" ON "Etf"("sourceSystem");
CREATE UNIQUE INDEX "Etf_isin_exchangeId_key" ON "Etf"("isin", "exchangeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Instrument_nameSource_idx" ON "Instrument"("nameSource");
