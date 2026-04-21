import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Type for getThread return value
type ThreadWithMessages = {
  thread: {
    _id: Id<"chatThreads">;
    _creationTime: number;
    userId: Id<"users">;
    title: string;
    systemPrompt: string;
    model?: string;
    createdAt: number;
    updatedAt: number;
  };
  messages: Array<{
    _id: Id<"chatMessages">;
    _creationTime: number;
    threadId: Id<"chatThreads">;
    role: "user" | "assistant";
    content: string;
    createdAt: number;
  }>;
} | null;

/**
 * List all chat threads for the authenticated user
 */
export const listThreads = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("chatThreads"),
      _creationTime: v.number(),
      userId: v.id("users"),
      title: v.string(),
      systemPrompt: v.string(),
      model: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        // Return empty array for unauthenticated users instead of throwing
        // This allows the UI to handle the unauthenticated state gracefully
        return [];
      }

      // Try to query threads - if table doesn't exist, this will throw
      const threads = await ctx.db
        .query("chatThreads")
        .withIndex("by_userId_updatedAt", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
      return threads;
    } catch (error) {
      // If table doesn't exist or index is missing, return empty array
      // This can happen if schema hasn't been applied yet
      if (error instanceof Error && (
        error.message.includes("Table") || 
        error.message.includes("Index") ||
        error.message.includes("not found")
      )) {
        console.warn("ChatThreads table or index not found, returning empty array", error.message);
        return [];
      }
      throw error;
    }
  },
});

/**
 * Get a single thread with its messages
 */
export const getThread = query({
  args: { threadId: v.id("chatThreads") },
  returns: v.union(
    v.null(),
    v.object({
      thread: v.object({
        _id: v.id("chatThreads"),
        _creationTime: v.number(),
        userId: v.id("users"),
        title: v.string(),
        systemPrompt: v.string(),
        model: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
      messages: v.array(
        v.object({
          _id: v.id("chatMessages"),
          _creationTime: v.number(),
          threadId: v.id("chatThreads"),
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
          createdAt: v.number(),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        // Return null for unauthenticated users instead of throwing
        // This allows the UI to handle the unauthenticated state gracefully
        return null;
      }

      const thread = await ctx.db.get(args.threadId);
      if (!thread || thread.userId !== userId) {
        return null;
      }

      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_threadId_createdAt", (q) => q.eq("threadId", args.threadId))
        .order("asc")
        .collect();

      return { thread, messages };
    } catch (error) {
      // If tables don't exist, return null
      if (error instanceof Error && (
        error.message.includes("Table") || 
        error.message.includes("Index") ||
        error.message.includes("not found")
      )) {
        console.warn("ChatThreads or ChatMessages table not found", error.message);
        return null;
      }
      throw error;
    }
  },
});

/**
 * Create a new chat thread (authentication required)
 */
export const createThread = mutation({
  args: {
    title: v.string(),
    systemPrompt: v.string(),
    model: v.optional(v.string()),
  },
  returns: v.id("chatThreads"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    // Default model for OpenRouter if not provided
    const model = args.model || "google/gemini-2.5-flash-lite";
    const threadId = await ctx.db.insert("chatThreads", {
      userId,
      title: args.title,
      systemPrompt: args.systemPrompt,
      model,
      createdAt: now,
      updatedAt: now,
    });

    return threadId;
  },
});

/**
 * Update thread title or system prompt (authentication required)
 */
export const updateThread = mutation({
  args: {
    threadId: v.id("chatThreads"),
    title: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      throw new Error("Thread not found or access denied");
    }

    const updates: {
      title?: string;
      systemPrompt?: string;
      model?: string;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title;
    }
    if (args.systemPrompt !== undefined) {
      updates.systemPrompt = args.systemPrompt;
    }
    if (args.model !== undefined) {
      updates.model = args.model;
    }

    await ctx.db.patch(args.threadId, updates);
    return null;
  },
});

/**
 * Delete a thread and all its messages (authentication required)
 */
export const deleteThread = mutation({
  args: { threadId: v.id("chatThreads") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      throw new Error("Thread not found or access denied");
    }

    // Delete all messages
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete thread
    await ctx.db.delete(args.threadId);
    return null;
  },
});

/**
 * Add a user message to a thread (authentication required)
 */
export const addUserMessage = mutation({
  args: {
    threadId: v.id("chatThreads"),
    content: v.string(),
  },
  returns: v.id("chatMessages"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      throw new Error("Thread not found or access denied");
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("chatMessages", {
      threadId: args.threadId,
      role: "user",
      content: args.content,
      createdAt: now,
    });

    // Update thread updatedAt
    await ctx.db.patch(args.threadId, { updatedAt: now });

    return messageId;
  },
});

/**
 * Add an assistant message to a thread (authentication required)
 */
export const addAssistantMessage = mutation({
  args: {
    threadId: v.id("chatThreads"),
    content: v.string(),
  },
  returns: v.id("chatMessages"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      throw new Error("Thread not found or access denied");
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("chatMessages", {
      threadId: args.threadId,
      role: "assistant",
      content: args.content,
      createdAt: now,
    });

    // Update thread updatedAt
    await ctx.db.patch(args.threadId, { updatedAt: now });

    return messageId;
  },
});

/**
 * Send a message to the AI and get a response
 * Uses ANDROMO_AI_API_KEY from environment to call OpenRouter API directly
 * Authentication required - saves to database
 */
export const sendMessage = action({
  args: {
    threadId: v.id("chatThreads"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get thread (will check authentication and ownership)
    const thread: ThreadWithMessages = await ctx.runQuery(api.aiChat.getThread, {
      threadId: args.threadId,
    });

    if (!thread) {
      throw new Error("Thread not found or access denied");
    }

    // Add user message
    const userMessageId: Id<"chatMessages"> = await ctx.runMutation(api.aiChat.addUserMessage, {
      threadId: args.threadId,
      content: args.content,
    });

    // Get API key from environment
    const apiKey = process.env.ANDROMO_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "AI integration is not configured. Please set up AI integration using the 'add_ai_tool' or contact support to provision an API key."
      );
    }

    // Prepare messages for AI
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

    // Add system prompt if provided
    if (thread.thread.systemPrompt) {
      messages.push({
        role: "system",
        content: thread.thread.systemPrompt,
      });
    }

    // Add conversation history
    for (const msg of thread.messages) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: args.content,
    });

    // Determine model (default to Gemini Flash Lite)
    // OpenRouter uses format: google/gemini-2.5-flash-lite
    const model =
      thread.thread.model ||
      "google/gemini-2.5-flash-lite";

    // Call OpenRouter API directly
    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

    const response = await fetch(openRouterUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.CONVEX_SITE_URL || "", // Optional: for OpenRouter analytics
        "X-Title": "Andromo AI Chat", // Optional: for OpenRouter analytics
        "User-Agent": "Andromo/1.0", // Identify the client
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000, // Prevent runaway costs - set reasonable limits
        temperature: 0.7, // Set reasonable defaults (0.0-2.0, higher = more creative)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json() as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    const assistantContent =
      data.choices?.[0]?.message?.content || "No response from AI";

    // Add assistant message
    await ctx.runMutation(
      api.aiChat.addAssistantMessage,
      {
        threadId: args.threadId,
        content: assistantContent,
      }
    );

    return null;
  },
});

