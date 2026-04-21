import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const list = query({
  args: { period: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("budgets")
      .withIndex("by_userId_period", (q) => q.eq("userId", userId).eq("period", args.period))
      .collect();
  },
});
export const upsert = mutation({
  args: {
    category: v.string(),
    amount: v.number(),
    period: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_userId_category_period", (q) => 
        q.eq("userId", userId).eq("category", args.category).eq("period", args.period)
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { amount: args.amount });
      return existing._id;
    } else {
      return await ctx.db.insert("budgets", {
        userId,
        category: args.category,
        amount: args.amount,
        period: args.period,
      });
    }
  },
});
export const getBudgetStatus = query({
  args: { period: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_userId_period", (q) => q.eq("userId", userId).eq("period", args.period))
      .collect();
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    // Filter transactions by period
    const periodTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      const p = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return p === args.period && t.type === "expense";
    });
    return budgets.map(budget => {
      const spent = periodTransactions
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percent: Math.min((spent / budget.amount) * 100, 100)
      };
    });
  },
});