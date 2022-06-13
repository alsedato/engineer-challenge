/*
  Warnings:

  - You are about to drop the `FamilyMembersOnPolicy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FamilyMembersOnPolicy" DROP CONSTRAINT "FamilyMembersOnPolicy_familyMemberId_fkey";

-- DropForeignKey
ALTER TABLE "FamilyMembersOnPolicy" DROP CONSTRAINT "FamilyMembersOnPolicy_policyId_fkey";

-- DropTable
DROP TABLE "FamilyMembersOnPolicy";

-- CreateTable
CREATE TABLE "_FamilyMemberToPolicy" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FamilyMemberToPolicy_AB_unique" ON "_FamilyMemberToPolicy"("A", "B");

-- CreateIndex
CREATE INDEX "_FamilyMemberToPolicy_B_index" ON "_FamilyMemberToPolicy"("B");

-- AddForeignKey
ALTER TABLE "_FamilyMemberToPolicy" ADD CONSTRAINT "_FamilyMemberToPolicy_A_fkey" FOREIGN KEY ("A") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FamilyMemberToPolicy" ADD CONSTRAINT "_FamilyMemberToPolicy_B_fkey" FOREIGN KEY ("B") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
