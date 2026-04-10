-- CreateTable
CREATE TABLE "tokens_revocados" (
    "jti" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_revocados_pkey" PRIMARY KEY ("jti")
);

-- CreateIndex
CREATE INDEX "tokens_revocados_expires_at_idx" ON "tokens_revocados"("expires_at");
