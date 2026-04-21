import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("transactions"),
      _creationTime: v.number(),
      userId: v.id("users"),
      amount: v.number(),
      type: v.union(v.literal("income"), v.literal("expense")),
      category: v.string(),
      date: v.number(),
      description: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("transactions")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
export const add = mutation({
  args: {
    amount: v.number(),
    type: v.union(v.literal("income"), v.literal("expense")),
    category: v.string(),
    date: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.db.insert("transactions", {
      userId,
      ...args,
    });
  },
});
export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Not found or unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});
export const getStats = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      totalBalance: v.number(),
      totalIncome: v.number(),
      totalExpenses: v.number(),
      categoryData: v.array(v.object({ name: v.string(), value: v.number() })),
      recentTransactions: v.array(
        v.object({
          _id: v.id("transactions"),
          _creationTime: v.number(),
          userId: v.id("users"),
          amount: v.number(),
          type: v.union(v.literal("income"), v.literal("expense")),
          category: v.string(),
          date: v.number(),
          description: v.optional(v.string()),
        })
      ),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    let totalBalance = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryBreakdown: Record<string, number> = {};
    // Sort transactions by date descending for "recent" slice
    const sorted = [...transactions].sort((a, b) => b.date - a.date);
    for (const t of transactions) {
      if (t.type === "income") {
        totalIncome += t.amount;
        totalBalance += t.amount;
      } else {
        totalExpenses += t.amount;
        totalBalance -= t.amount;
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      }
    }
    const categoryData = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name,
      value,
    }));
    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      categoryData,
      recentTransactions: sorted.slice(0, 5),
    };
  },
});