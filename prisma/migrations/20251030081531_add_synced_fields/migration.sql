-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "category" TEXT,
    "image" TEXT,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" DATETIME,
    "publishedAt" DATETIME,
    "isBreaking" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Article" ("category", "content", "createdAt", "excerpt", "id", "image", "isBreaking", "publishedAt", "shares", "slug", "title", "views") SELECT "category", "content", "createdAt", "excerpt", "id", "image", "isBreaking", "publishedAt", "shares", "slug", "title", "views" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
