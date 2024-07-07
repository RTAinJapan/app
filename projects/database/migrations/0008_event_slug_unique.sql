-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'hidden',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Events" ("createdAt", "endTime", "id", "name", "slug", "startTime", "status", "updatedAt") SELECT "createdAt", "endTime", "id", "name", "slug", "startTime", "status", "updatedAt" FROM "Events";
DROP TABLE "Events";
ALTER TABLE "new_Events" RENAME TO "Events";
CREATE UNIQUE INDEX "Events_slug_key" ON "Events"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
