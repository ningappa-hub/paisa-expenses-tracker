import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { NextResponse } from "next/server";

const parsedTransaction = z.object({
  title: z.string().min(1).max(120),
  amountMinor: z.number().int().positive(),
  type: z.enum(["EXPENSE", "DEPOSIT", "UPI_CREDIT", "UPI_PAYMENT", "ATM_WITHDRAWAL"]),
  category: z.string().max(80).nullable(),
  accountHint: z.string().max(120).nullable(),
  occurredAt: z.string().nullable(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Text is required." }, { status: 400 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 503 });

  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent({
    systemInstruction: "You convert a personal finance sentence into JSON. Amount must be in INR paise. Never invent an account. Use EXPENSE for spending, DEPOSIT for cash/bank deposits, UPI_CREDIT for money received by UPI, UPI_PAYMENT for UPI spending, and ATM_WITHDRAWAL for cash withdrawal.",
    contents: [{ role: "user", parts: [{ text: `Return only valid JSON matching this shape: {"title":string,"amountMinor":number,"type":"EXPENSE"|"DEPOSIT"|"UPI_CREDIT"|"UPI_PAYMENT"|"ATM_WITHDRAWAL","category":string|null,"accountHint":string|null,"occurredAt":string|null}\n\nInput: ${text}` }] }],
  });

  const raw = result.response.text().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = parsedTransaction.safeParse(JSON.parse(raw));
  if (!parsed.success) return NextResponse.json({ error: "Gemini returned an invalid transaction.", details: parsed.error.flatten() }, { status: 502 });
  return NextResponse.json(parsed.data);
}
