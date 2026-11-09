import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const accountInput = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["BANK", "CASH"]),
  balanceMinor: z.number().int().nonnegative(),
  lastFour: z.string().regex(/^\d{4}$/).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accounts = await prisma.account.findMany({ where: { user: { email: session.user.email } }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(accounts.map((account) => ({ ...account, balanceMinor: account.balanceMinor.toString() })));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = accountInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid account", details: parsed.error.flatten() }, { status: 400 });
  const user = await prisma.user.upsert({ where: { email: session.user.email }, update: {}, create: { email: session.user.email, name: session.user.name, image: session.user.image } });
  const account = await prisma.account.create({ data: { ...parsed.data, balanceMinor: BigInt(parsed.data.balanceMinor), userId: user.id } });
  return NextResponse.json({ ...account, balanceMinor: account.balanceMinor.toString() }, { status: 201 });
}
