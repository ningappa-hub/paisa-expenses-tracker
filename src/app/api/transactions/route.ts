import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const transactionInput = z.object({
  title: z.string().min(1).max(120),
  type: z.enum(["EXPENSE", "DEPOSIT", "UPI_CREDIT", "UPI_PAYMENT", "ATM_WITHDRAWAL", "TRANSFER"]),
  amountMinor: z.number().int().positive(),
  category: z.string().max(80).optional(),
  accountId: z.string().min(1),
  sourceText: z.string().max(1000).optional(),
});

const increasesBalance = new Set(["DEPOSIT", "UPI_CREDIT"]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = transactionInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid transaction", details: parsed.error.flatten() }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const result = await prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({ where: { id: parsed.data.accountId, userId: user.id } });
    if (!account) throw new Error("Account not found");
    const delta = increasesBalance.has(parsed.data.type) ? BigInt(parsed.data.amountMinor) : -BigInt(parsed.data.amountMinor);
    if (account.balanceMinor + delta < BigInt(0)) throw new Error("Insufficient funds");
    await tx.account.update({ where: { id: account.id }, data: { balanceMinor: { increment: delta } } });
    return tx.transaction.create({ data: { ...parsed.data, amountMinor: BigInt(parsed.data.amountMinor), userId: user.id } });
  }).catch((error: Error) => ({ error: error.message }));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ...result, amountMinor: result.amountMinor.toString() }, { status: 201 });
}
