"use client";

import { FormEvent, useMemo, useState } from "react";

type Transaction = {
  id: number;
  title: string;
  category: string;
  account: string;
  date: string;
  amount: number;
  type: "expense" | "income";
  icon: string;
};

const initialTransactions: Transaction[] = [
  { id: 1, title: "Swiggy", category: "Food & dining", account: "HDFC Bank", date: "Today, 12:48 PM", amount: 420, type: "expense", icon: "🍔" },
  { id: 2, title: "Salary credit", category: "Income", account: "HDFC Bank", date: "Yesterday, 9:00 AM", amount: 85000, type: "income", icon: "↗" },
  { id: 3, title: "Uber", category: "Transport", account: "Cash wallet", date: "Yesterday, 7:34 PM", amount: 268, type: "expense", icon: "🚕" },
  { id: 4, title: "Amazon", category: "Shopping", account: "HDFC Bank", date: "10 Nov, 4:21 PM", amount: 1299, type: "expense", icon: "🛍️" },
  { id: 5, title: "UPI transfer from Priya", category: "UPI credit", account: "HDFC Bank", date: "9 Nov, 11:15 AM", amount: 2500, type: "income", icon: "↙" },
];

const initialAccounts = [
  { name: "HDFC Bank", kind: "Bank account", balance: 126480, color: "bg-sky-500", last4: "4821" },
  { name: "ICICI Bank", kind: "Bank account", balance: 48320, color: "bg-orange-500", last4: "9014" },
  { name: "Cash wallet", kind: "Cash", balance: 8750, color: "bg-emerald-500", last4: "" },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function Home() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [query, setQuery] = useState("");
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [notice, setNotice] = useState("");

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const monthSpend = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const visibleTransactions = useMemo(
    () => (showAll ? transactions : transactions.slice(0, 5)).filter((item) =>
      `${item.title} ${item.category} ${item.account}`.toLowerCase().includes(query.toLowerCase()),
    ),
    [query, showAll, transactions],
  );

  function parseExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = String(form.get("expense") || "").trim();
    if (!text) return;
    const amountMatch = text.match(/(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)/i);
    const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : 0;
    const title = text.replace(amountMatch?.[0] || "", "").replace(/\b(on|using|via|for)\b/gi, "").trim() || "New expense";
    const next = { id: Date.now(), title: title.charAt(0).toUpperCase() + title.slice(1), category: "Uncategorised", account: "HDFC Bank", date: "Just now", amount, type: "expense" as const, icon: "✦" };
    setTransactions((current) => [next, ...current]);
    setNotice(amount ? "Draft created and added to your activity." : "Added as a draft — add an amount to update balances.");
    event.currentTarget.reset();
  }

  function addAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accountName || !accountBalance) return;
    setAccounts((current) => [...current, { name: accountName, kind: "Bank account", balance: Number(accountBalance), color: "bg-violet-500", last4: "0000" }]);
    setAccountName("");
    setAccountBalance("");
    setShowAccountForm(false);
    setNotice("Account added successfully.");
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-lg text-white">✦</div><span className="text-xl font-bold tracking-tight">paisa</span></div>
          <div className="flex items-center gap-4"><button className="rounded-full px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">Help</button><div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 font-semibold text-indigo-700">AK</div><span className="hidden text-sm font-medium sm:block">Arjun Kumar</span><span className="text-slate-400">⌄</span></div></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-8 lg:grid-cols-[220px_1fr] lg:px-10">
        <aside className="hidden lg:block">
          <nav className="space-y-1 text-sm">
            {["Overview", "Transactions", "Accounts", "Insights"].map((item, index) => <button key={item} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium ${index === 0 ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-white"}`}><span>{["⌂", "↕", "▣", "◔"][index]}</span>{item}</button>)}
          </nav>
          <div className="mt-12 rounded-2xl bg-indigo-600 p-5 text-white"><div className="mb-3 text-2xl">✦</div><p className="font-semibold">Make money feel simple.</p><p className="mt-2 text-sm leading-5 text-indigo-100">Add expenses in your own words. Paisa will organise them for you.</p></div>
        </aside>
        <section>
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-indigo-600">Monday, 11 November 2024</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Good morning, Arjun <span>👋</span></h1><p className="mt-2 text-slate-500">Here&apos;s your money at a glance.</p></div><button onClick={() => setShowAccountForm(true)} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">+ Add account</button></div>
          {notice && <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{notice}</div>}
          <form onSubmit={parseExpense} className="mb-8 rounded-2xl bg-indigo-600 p-3 shadow-lg shadow-indigo-200 sm:p-4"><div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3"><span className="text-lg text-indigo-600">✦</span><input name="expense" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Try “₹420 on Swiggy using HDFC Bank”" /><button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Add expense</button></div><p className="px-2 pt-3 text-xs text-indigo-100">Natural language is supported. We&apos;ll review the details before saving.</p></form>
          <div className="mb-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="text-sm text-slate-400">Total balance</p><p className="mt-2 text-3xl font-bold">{money(totalBalance)}</p><p className="mt-3 text-xs text-emerald-300">↑ 4.8% from last month</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Spent this month</p><p className="mt-2 text-3xl font-bold">{money(monthSpend)}</p><p className="mt-3 text-xs text-slate-400">Across {transactions.filter((t) => t.type === "expense").length} transactions</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">You&apos;re on track</p><p className="mt-2 text-3xl font-bold">68%</p><div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-2 w-[68%] rounded-full bg-indigo-500" /></div></div></div>
          <div className="grid gap-8 xl:grid-cols-[1fr_320px]"><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Recent activity</h2><p className="mt-1 text-sm text-slate-500">Your latest money movements</p></div><button onClick={() => setShowAll(!showAll)} className="text-sm font-semibold text-indigo-600">{showAll ? "Show less" : "View all"}</button></div><div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2"><span className="text-slate-400">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search transactions" /></div><div className="divide-y divide-slate-100">{visibleTransactions.map((transaction) => <div key={transaction.id} className="flex items-center justify-between py-4"><div className="flex min-w-0 items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg">{transaction.icon}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{transaction.title}</p><p className="truncate text-xs text-slate-400">{transaction.category} · {transaction.account} · {transaction.date}</p></div></div><p className={`text-sm font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-slate-900"}`}>{transaction.type === "income" ? "+" : "-"}{money(transaction.amount)}</p></div>)}</div></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Your accounts</h2><p className="mt-1 text-sm text-slate-500">Where your money lives</p></div><button onClick={() => setShowAccountForm(true)} className="text-xl text-indigo-600">+</button></div><div className="space-y-3">{accounts.map((account) => <div key={account.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-3"><div className={`grid h-9 w-9 place-items-center rounded-lg text-sm text-white ${account.color}`}>{account.kind === "Cash" ? "◉" : "▣"}</div><div><p className="text-sm font-semibold">{account.name}</p><p className="text-xs text-slate-400">{account.kind}{account.last4 && ` · •••• ${account.last4}`}</p></div></div><p className="text-sm font-semibold">{money(account.balance)}</p></div>)}</div></div></div>
        </section>
      </div>
      {showAccountForm && <div className="fixed inset-0 z-10 grid place-items-center bg-slate-950/30 p-4"><form onSubmit={addAccount} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-6 flex items-start justify-between"><div><h2 className="text-xl font-bold">Add an account</h2><p className="mt-1 text-sm text-slate-500">Track a bank account or wallet.</p></div><button type="button" onClick={() => setShowAccountForm(false)} className="text-xl text-slate-400">×</button></div><label className="mb-4 block text-sm font-medium">Account name<input value={accountName} onChange={(e) => setAccountName(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-indigo-500" placeholder="e.g. HDFC Bank" /></label><label className="mb-6 block text-sm font-medium">Current balance<input value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} required type="number" min="0" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-indigo-500" placeholder="0" /></label><button className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700">Add account</button></form></div>}
    </main>
  );
}
