import { db } from './index'; //connect my dB
import { notes, tags, noteTags } from './schema';
import { eq } from 'drizzle-orm';

async function testSchema() {
  console.log("🚀 Starting Schema Test...");

  try {
    
    // 2. insert tag
    console.log("insert tag...");
    const [newTag] = await db.insert(tags).values({
      label: "React",
      color: "#61dafb"
    }).returning();

    // 3. insert note
    console.log("insert note...");
    const [newNote] = await db.insert(notes).values({
      title: "Learning Drizzle",
      content: "Testing many-to-many relationship with Neon.",
      status: "active"
    }).returning();

    // 4. build connection 
    console.log("build connection...");
    await db.insert(noteTags).values({
      noteId: newNote.id,
      tagId: newTag.id
    });

    // 5. check connect 
    console.log("check connect...");
    const result = await db
      .select()
      .from(notes)
      .leftJoin(noteTags, eq(notes.id, noteTags.noteId))
      .leftJoin(tags, eq(noteTags.tagId, tags.id))
      .where(eq(notes.id, newNote.id));

    console.log("✅ successful:", JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("❌ failed:", error);
  }
}

testSchema();