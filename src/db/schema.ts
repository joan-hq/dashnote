import { pgTable, 
  uuid, 
  text, 
  timestamp, 
  primaryKey,
  varchar,
  pgEnum,
uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const noteStatusEnum = pgEnum("note_status", ["active", "archived", "trashed"]);

export const notes = pgTable(
  "notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull().default(''),
  content: text("content").notNull().default(''),
  status: noteStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("create_at").defaultNow().notNull(),
  lastEdit: timestamp("last_edit").defaultNow().notNull(),

  date: varchar("date", { length: 10 }),
  type: text("type").default("manual").notNull(),
 
},

(table) => [
    uniqueIndex("user_date_ai_unq").on(table.userId, table.date)
  ]

);

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull().unique(), 
  color: text("color").default("#cbd5e1"),
});


export const noteTags = pgTable("note_tags", {
  noteId: uuid("note_id")
    .notNull()
    .references(() => notes.id, { onDelete: "cascade" }), 
  tagId: uuid("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }), 
}, (table) => [
  // combined primarykey
  primaryKey({ columns: [table.noteId, table.tagId] }),
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  // googleId: text("google_id").unique(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

