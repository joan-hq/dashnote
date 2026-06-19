import { db } from './index';
import { tags } from './schema';
import { eq,and } from 'drizzle-orm';
import { Tag } from '@/features/tags/types/tagType';


export const TagDb = {

    getAll: async (userId:string):Promise<Tag[]> => {
        return await db.select().from(tags).where(eq(tags.userId, userId));
    },

    insert: async(newTag: Tag & { userId: string }) => {
        return await db.insert(tags).values(newTag);
    },

    delete: async(userId:string, id: string) => {
        return await db.delete(tags).where(
          and(  
            eq(tags.id,id),
            eq(tags.userId,userId)
        ));
    },

    update: async(userId:string, id: string, changes: Partial<Tag>) => {
        return await db.update(tags).set(changes).where(and(
            eq(tags.id,id),
            eq(tags.userId,userId)
        ));
    },

}