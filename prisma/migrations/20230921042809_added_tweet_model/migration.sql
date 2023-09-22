-- CreateTable
CREATE TABLE "Tweet" (
    "tweetID" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageURL" TEXT,
    "tweetUserID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAT" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tweet_pkey" PRIMARY KEY ("tweetID")
);

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_tweetUserID_fkey" FOREIGN KEY ("tweetUserID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
