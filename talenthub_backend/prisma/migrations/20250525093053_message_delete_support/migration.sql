/*
  Warnings:

  - You are about to drop the column `fileType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "fileType",
DROP COLUMN "fileUrl";

-- CreateTable
CREATE TABLE "MessageDelete" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "messageId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageDelete_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageDelete_userId_idx" ON "MessageDelete"("userId");

-- CreateIndex
CREATE INDEX "MessageDelete_messageId_idx" ON "MessageDelete"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageDelete_userId_messageId_key" ON "MessageDelete"("userId", "messageId");

-- AddForeignKey
ALTER TABLE "MessageDelete" ADD CONSTRAINT "MessageDelete_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDelete" ADD CONSTRAINT "MessageDelete_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
