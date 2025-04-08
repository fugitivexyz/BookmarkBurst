import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Bookmarks table schema
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  favicon: text("favicon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
  tags: text("tags").array(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).pick({
  url: true,
  title: true,
  description: true,
  favicon: true,
  tags: true,
  metadata: true,
});

export const updateBookmarkSchema = createInsertSchema(bookmarks).pick({
  title: true,
  description: true,
  tags: true,
});

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type UpdateBookmark = z.infer<typeof updateBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
