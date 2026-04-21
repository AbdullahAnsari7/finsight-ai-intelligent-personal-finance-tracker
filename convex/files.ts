import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFileMetadata = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Failed to get storage URL");
    }

    const fileId = await ctx.db.insert("files", {
      userId,
      storageId: args.storageId,
      filename: args.filename,
      mimeType: args.mimeType,
      size: args.size,
      description: args.description,
      uploadedAt: Date.now(),
    });

    return { fileId, url };
  },
});

export const listFiles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_userId_uploadedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      }))
    );
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const file = await ctx.db
      .query("files")
      .withIndex("by_userId_storageId", (q) =>
        q.eq("userId", userId).eq("storageId", args.storageId)
      )
      .unique();

    if (!file) {
      return null;
    }

    return await ctx.storage.getUrl(file.storageId);
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file || file.userId !== userId) {
      throw new Error("File not found");
    }
    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(args.fileId);
  },
});
