import { 
  users, 
  type User, 
  type InsertUser,
  bookmarks,
  type Bookmark,
  type InsertBookmark,
  type UpdateBookmark
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookmarksMap: Map<number, Bookmark>;
  userCurrentId: number;
  bookmarkCurrentId: number;

  constructor() {
    this.users = new Map();
    this.bookmarksMap = new Map();
    this.userCurrentId = 1;
    this.bookmarkCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Bookmark methods
  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkCurrentId++;
    const createdAt = new Date();
    
    const bookmark: Bookmark = { 
      ...insertBookmark, 
      id, 
      createdAt 
    };
    
    this.bookmarksMap.set(id, bookmark);
    return bookmark;
  }

  async getBookmarks(): Promise<Bookmark[]> {
    return Array.from(this.bookmarksMap.values()).sort((a, b) => {
      // Sort by creation date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async getBookmarkById(id: number): Promise<Bookmark | undefined> {
    return this.bookmarksMap.get(id);
  }

  async updateBookmark(id: number, updateData: UpdateBookmark): Promise<Bookmark | undefined> {
    const bookmark = this.bookmarksMap.get(id);
    
    if (!bookmark) {
      return undefined;
    }
    
    const updatedBookmark: Bookmark = {
      ...bookmark,
      ...updateData,
    };
    
    this.bookmarksMap.set(id, updatedBookmark);
    return updatedBookmark;
  }

  async deleteBookmark(id: number): Promise<boolean> {
    return this.bookmarksMap.delete(id);
  }
}

export const storage = new MemStorage();
