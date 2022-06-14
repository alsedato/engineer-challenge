-- CreateTable
CREATE TABLE "PolicyHistory" (
    "id" UUID NOT NULL,
    "record" JSONB NOT NULL,
    "policyId" UUID NOT NULL,

    CONSTRAINT "PolicyHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PolicyHistory" ADD CONSTRAINT "PolicyHistory_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
