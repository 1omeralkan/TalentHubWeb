-- CreateTable
CREATE TABLE "ChatDelete" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatDelete_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatDelete_userId_idx" ON "ChatDelete"("userId");

-- CreateIndex
CREATE INDEX "ChatDelete_chatId_idx" ON "ChatDelete"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatDelete_userId_chatId_key" ON "ChatDelete"("userId", "chatId");

-- AddForeignKey
ALTER TABLE "ChatDelete" ADD CONSTRAINT "ChatDelete_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatDelete" ADD CONSTRAINT "ChatDelete_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
