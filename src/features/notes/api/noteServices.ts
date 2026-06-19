
import {Note,FilterType, NoteStatus} from '@/features/notes/types/noteType';
import { v4 as uuidv4 } from 'uuid';
import {NoteDb} from '@/db/noteDb'


import { isEmptyString } from '@/utils/string';

export const NoteService = {

    getAll: async(userId:string) => {

        try{
            console.log("fetch NOte",NoteDb.getAll(userId));
            const notes = await NoteDb.getAll(userId);
            return notes.map(note => ({...note, title: note.title || 'no title'}));
        }catch(error){
            console.log("Failed to fetch notes:", error)
            throw error;
        }
     
    },

    checkNoteEmpty: (note: Note):boolean => {
        return isEmptyString(note.title) && isEmptyString(note.content);
    },

//create new note and insert to DB
    create: async (userId:string,title?: string, content?: string): Promise<Note>=>{
       
        const safeUserId = userId || "mock-user-id-for-ai";
       
        const newNote:Note = { 
        id: uuidv4(),
        userId: safeUserId,
        title: title || "",
        content: content || "",
        status: 'active' as NoteStatus,
        tags: [],
        createdAt: new Date().toISOString(),
        lastEdit: new Date().toISOString(),
       
        };

        try{
            console.log("🚀 [NoteDb]  try to insert note:", { id: newNote.id, title: newNote.title });
            await NoteDb.insert(newNote);
            return newNote;

        }catch(error){
            console.error("❌ [NoteDb Insert Error]:", error);
            throw error;
        }
    },

    update: async (id:string, changes: Partial<Note>):Promise<void> => {
        console.log('updateNote called', id, changes);
        if(!id){
            console.log("Error: Attempted toi update note without ID");
            return;
        }

        try{
            await NoteDb.update(id, changes);
        }catch(error){
            console.log("Failed to update note to DB:", error)
            throw error;
        }
    },

    /** update status */
   restore: (id: string,): Promise<void> => {
        return NoteService.update(id,{status: 'active'});
    },

    archive: (id: string,): Promise<void> => {
        return NoteService.update(id,{status: 'archived'});
    },

    delete: (id: string, ): Promise<void> => {
        return NoteService.update(id,{status:'trashed'});
    },

    deletePermanently: (id: string,) => {
        return NoteDb.permanentlyDelete(id);
    },
    
    /**update name */
    rename: (id:string, newTitle: string,) => {
        if(newTitle.length > 50) throw Error("Title too long");
        return NoteService.update(id, {title: newTitle});
    },

    /**update tags */
    updateTags: async (userId:string, noteId: string, newTagIds: string[]): Promise<void> => {
            try {
                // 1. get all Tags
                const currentNotes = await NoteDb.getAll(userId); 
                const currentNote = currentNotes.find(n => n.id === noteId);
                const oldTagIds = currentNote?.tags || [];

                // 2. find add / remove 
                const toAdd = newTagIds.filter(id => !oldTagIds.includes(id));
                const toRemove = oldTagIds.filter(id => !newTagIds.includes(id));

                // 3. start action
                const promises = [
                    ...toAdd.map(tagId => NoteDb.bindTag(noteId, tagId)),
                    ...toRemove.map(tagId => NoteDb.unbindTag(noteId, tagId))
                ];
                
                    await Promise.all(promises);
                } catch (error) {
                    console.error("Failed to sync tags:", error);
                    throw error;
            }
    },



    filterNoteByStatus: async (userId:string,status: FilterType): Promise<Note[]> => {
        try{

            if(status === 'all') {
            return await NoteDb.getAll(userId);
        }
            return await NoteDb.getByStatus(userId,status as NoteStatus);
        }catch(error){
            console.log("Failed to filter notes by status",error);
            throw error;
        }

    },

    sortNoteByEdit: (notes: Note[]):Note[] => {

        return [...notes].sort((a,b) => new Date(b.lastEdit).getTime() - new Date(a.lastEdit).getTime())
    },

    sortNoteByName: (notes: Note[]): Note[] => {
        return [...notes].sort((a,b) => {
            return a.title.localeCompare(b.title);
        })
    },

    countNotes: (notes: Note[]) => {
        return {
            active: notes.filter(n => n.status === 'active').length,
            archived: notes.filter(n => n.status === 'archived').length,
            trashed: notes.filter(n => n.status === 'trashed').length,
        };
    },


    syncTagToggle: async (note: Note, tagId: string): Promise<void> => {
        const { id: noteId, tags } = note;
        const isAdding = !tags.includes(tagId); 

        try {
            if (isAdding) {
                await NoteDb.bindTag(noteId, tagId);
            } else {
                await NoteDb.unbindTag(noteId, tagId);
            }
        } catch (error) {
            console.error("Failed to sync tag toggle:", error);
            throw error;
        }
    }
}


