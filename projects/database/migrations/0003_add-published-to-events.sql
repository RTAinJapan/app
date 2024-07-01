-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Events" ("createdAt", "fullName", "id", "shortName", "startTime", "updatedAt") SELECT "createdAt", "fullName", "id", "shortName", "startTime", "updatedAt" FROM "Events";
DROP TABLE "Events";
ALTER TABLE "new_Events" RENAME TO "Events";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
