import { 
  users, 
  type User, 
  type InsertUser,
  bookmarks,
  type Bookmark,
  type InsertBookmark,
  type UpdateBookmark
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bookmark methods
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  getBookmarks(): Promise<Bookmark[]>;
  getBookmarkById(id: number): Promise<Bookmark | undefined>;
  updateBookmark(id: number, bookmark: UpdateBookmark): Promise<Bookmark | undefined>;
  deleteBookmark(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Bookmark methods
  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const [bookmark] = await db.insert(bookmarks).values(insertBookmark).returning();
    return bookmark;
  }

  async getBookmarks(): Promise<Bookmark[]> {
    return await db.select().from(bookmarks).orderBy(desc(bookmarks.createdAt));
  }

  async getBookmarkById(id: number): Promise<Bookmark | undefined> {
    const [bookmark] = await db.select().from(bookmarks).where(eq(bookmarks.id, id));
    return bookmark;
  }

  async updateBookmark(id: number, updateData: UpdateBookmark): Promise<Bookmark | undefined> {
    const [updatedBookmark] = await db
      .update(bookmarks)
      .set(updateData)
      .where(eq(bookmarks.id, id))
      .returning();
    
    return updatedBookmark;
  }

  async deleteBookmark(id: number): Promise<boolean> {
    const [deletedBookmark] = await db
      .delete(bookmarks)
      .where(eq(bookmarks.id, id))
      .returning();
    
    return !!deletedBookmark;
  }
}

export const storage = new DatabaseStorage();
