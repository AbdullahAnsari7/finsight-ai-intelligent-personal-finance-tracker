import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
export const generateInsight = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const transactions = await ctx.runQuery(api.transactions.list);
    const recentTx = transactions.slice(0, 50);
    const txSummary = recentTx
      .map(t => `${new Date(t.date).toLocaleDateString()}: ${t.type} of $${t.amount} in ${t.category}${t.description ? ` (${t.description})` : ''}`)
      .join('\n');
    const apiKey = process.env.ANDROMO_AI_API_KEY;
    if (!apiKey) {
      throw new Error("AI integration not configured. Please contact support.");
    }
    const prompt = `You are FinSight AI, a premium financial advisor. Analyze these last 50 transactions and provide a 3-paragraph executive summary in plain text. Focus on:
1. Overall spending health and balance trends.
2. Specific category insights or potential areas for savings.
3. A clear, actionable financial goal for the next 30 days.
Transactions:
${txSummary || "No transactions recorded yet."}`;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "User-Agent": "FinSightAI/1.0",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API failed: ${error}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Could not generate insights at this time.";
  },
});