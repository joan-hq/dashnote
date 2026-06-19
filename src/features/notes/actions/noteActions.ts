'use server';

import { NoteService } from "../api/noteServices";
import { Note } from "../types/noteType";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const getUserId = async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
};

export const getAllNotesAction = async () => {
     const userId = await getUserId();
      console.log('getAllNotes userId:', userId);
     const notes =await NoteService.getAll(userId);
     console.log('getAllNotes notes:', userId);
     return notes;
}


export const createNoteAction = async (title?: string, content?: string): Promise<Note> => {
    try {
        const userId = await getUserId();
        return await NoteService.create(userId,title, content);
    } catch(error) { 
        throw error;
    }
}

export const updateNoteAction = async (id: string, changes: Partial<Note>) => {
    console.log('updateNoteAction called', id, changes);
    const userId = await getUserId();
    try {
        if (changes.tags !== undefined) {
            await NoteService.updateTags(userId, id, changes.tags);
        }

         const { tags, ...otherChanges } = changes;
        if (Object.keys(otherChanges).length > 0) {
            await NoteService.update(id, otherChanges);
        }
    } catch(error) {
        console.error('updateNoteAction error:', error); 
        throw error;
    }
}

export const deleteNoteAction = async (id: string) => {
    await getUserId();
    return await NoteService.delete(id);
}

export const permanentlyDeleteNoteAction = async (id: string) => {
    console.log('permanentlyDeleteNoteAction called', id);
    await getUserId();
    console.log('permanentlyDeleteNoteAction done');
    return await NoteService.deletePermanently(id);
}

// export const getFilteredNotesAction = async (options: {
//     userId:string;
//     status?: string;
//     selectedTagIds?: string[];
//     searchQuery?: string;
// }) => {
//     return await NoteService.getFilteredNote(options);
// }