-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "user_id" TEXT,
    "username" TEXT,
    "ip" TEXT,
    "recurso" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "audit_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_evento_idx" ON "audit_log"("evento");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");
