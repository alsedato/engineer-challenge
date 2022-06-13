import { Router, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/policies", async (req: Request, res: Response) => {
  const { search, order, page, limit } = req.query;

  let currentPage = Number(page) || 1;
  const take = Number(limit) || 5;

  const skip = (currentPage - 1) * take;

  const orderGroups = String(order)
    .split(",")
    .map((group) => group.trim())
    .map((subSplit) => {
      let splitGroup = subSplit.split(":");

      return {
        [splitGroup[0]]: splitGroup[1],
      };
    });

  const or: Prisma.PolicyWhereInput = search
    ? {
        OR: [
          { provider: { contains: search as string, mode: "insensitive" } },
          {
            customer: {
              firstName: { contains: search as string, mode: "insensitive" },
            },
          },
          {
            customer: {
              lastName: { contains: search as string, mode: "insensitive" },
            },
          },
        ],
      }
    : {};

  const policies = await prisma.policy.findMany({
    take,
    skip,
    where: {
      ...or,
    },
    orderBy: order ? orderGroups : [],
    select: {
      id: true,
      provider: true,
      insuranceType: true,
      status: true,
      startDate: true,
      endDate: true,
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
        },
      },
      familyMembers: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return res.json(policies);
});

router.post("/policies", async (req: Request, res: Response) => {
  const {
    customer_id,
    provider,
    insurance_type,
    status,
    start_date,
    end_date,
    family_members,
  } = req.body;

  const customer = await prisma.customer.findUnique({
    where: {
      id: customer_id,
    },
  });

  if (!customer) {
    return res.status(404).json({
      status: false,
      message: "customer not found",
    });
  }

  let familyMembersList: string | any[] = [];

  if (
    family_members &&
    Array.isArray(family_members) &&
    family_members.length > 0
  ) {
    familyMembersList = family_members.map((m: any) => ({ id: m }));
  }

  const policy = await prisma.policy.create({
    data: {
      provider,
      insuranceType: insurance_type,
      status,
      startDate: start_date,
      endDate: end_date,
      customer: {
        connect: { id: customer_id },
      },
      familyMembers: { connect: familyMembersList },
    },
  });

  return res.status(201).json(policy);
});

router.get("/policies/:policy_id", async (req: Request, res: Response) => {
  const { policy_id: policyId } = req.params;

  const policy = await prisma.policy.findUnique({
    where: {
      id: policyId,
    },
    select: {
      id: true,
      provider: true,
      insuranceType: true,
      status: true,
      startDate: true,
      endDate: true,
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
        },
      },
      familyMembers: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return res.json(policy);
});

/* 

Family Members

*/
router.get(
  "/customers/:customer_id/family-members",
  async (req: Request, res: Response) => {
    const { customer_id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: {
        id: customer_id,
      },
    });

    if (!customer) {
      return res.status(404).json({
        status: false,
        message: "customer not found",
      });
    }

    const familyMembers = await prisma.familyMember.findMany({
      where: {
        customerId: customer_id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return res.json(familyMembers);
  }
);

router.post(
  "/customers/:customer_id/family-members",
  async (req: Request, res: Response) => {
    const { customer_id } = req.params;

    const { firstName, lastName } = req.body;

    const customer = await prisma.customer.findUnique({
      where: {
        id: customer_id,
      },
    });

    if (!customer) {
      return res.status(404).json({
        status: false,
        message: "customer not found",
      });
    }

    const duplicateFamilyMember = await prisma.familyMember.findFirst({
      where: {
        customerId: customer_id,
        firstName,
        lastName,
      },
    });

    if (duplicateFamilyMember) {
      return res.status(403).json({
        status: false,
        message: "member already exists",
      });
    }

    const familyMember = await prisma.familyMember.create({
      data: {
        firstName,
        lastName,
        customer: {
          connect: { id: customer_id },
        },
      },
    });

    return res.status(201).json(familyMember);
  }
);

module.exports = router;
