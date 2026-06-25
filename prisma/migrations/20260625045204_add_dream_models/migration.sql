-- CreateTable
CREATE TABLE "DreamEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "emotion" TEXT,
    "clarity" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "traditional" TEXT,
    "deeper" TEXT,
    "questions" TEXT,
    "feedback" TEXT,
    "relatedNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DreamEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DreamTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    CONSTRAINT "DreamTag_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DreamEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DreamTag_name_idx" ON "DreamTag"("name");
