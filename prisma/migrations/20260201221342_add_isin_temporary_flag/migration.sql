-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Instrument" (
    "isin" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameSource" TEXT NOT NULL,
    "classification" TEXT,
    "nameConflict" BOOLEAN NOT NULL DEFAULT false,
    "isinTemporary" BOOLEAN NOT NULL DEFAULT false,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL
);
INSERT INTO "new_Instrument" ("classification", "firstSeenAt", "isin", "lastSeenAt", "name", "nameConflict", "nameSource") SELECT "classification", "firstSeenAt", "isin", "lastSeenAt", "name", "nameConflict", "nameSource" FROM "Instrument";
DROP TABLE "Instrument";
ALTER TABLE "new_Instrument" RENAME TO "Instrument";
CREATE INDEX "Instrument_nameSource_idx" ON "Instrument"("nameSource");
CREATE INDEX "Instrument_isinTemporary_idx" ON "Instrument"("isinTemporary");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
