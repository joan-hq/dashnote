'use server';
import { TagService } from '../api/tagServices';
import { Tag } from '../types/tagType';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const getUserId = async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
};

export const getAllTagsAction = async (): Promise<Tag[]> => {
    try {
        const userId = await getUserId();
        const result = await TagService.getAll(userId);
        console.log('getAllTagsAction result', result);
        return result;
    } catch (error) {
        console.log('getAllTagsAction error:', error);
        throw error;
    }
}

export const createTagAction = async (label: string, tags: Tag[], color?: string): Promise<Tag> => {
    const userId = await getUserId();
    return await TagService.create(userId, label, tags, color);
}

export const updateTagAction = async (id: string, tags: Tag[], changes: Partial<Tag>): Promise<void> => {
    const userId = await getUserId();
    return await TagService.update(userId, id, tags, changes);
}

export const deleteTagAction = async (id: string): Promise<void> => {
    const userId = await getUserId();
    return await TagService.delete(userId, id);
}