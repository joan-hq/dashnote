import {Tag} from '@/features/tags/types/tagType';
import { v4 as uuidv4 } from 'uuid';
import { isEmptyString } from '@/utils/string';
import { TAG_VALIDATION_MESSAGES } from '@/constants/messages';
import { TagDb } from '@/db/tagDb';


export const TagService = {

    getAll: async(userId:string) : Promise<Tag[]>=> {
        try{
            console.log(TagDb.getAll(userId));
            return await TagDb.getAll(userId)
            
        }catch(error){
            console.log("Failed to fetch tags:", error)
            throw error;
        }
    },

    validation: (
        label: string,
        allTags: Tag[],
        editingTagId? : string,

    ): {isValid: boolean; error?: string } => {
        const trimmedLabel = label.trim();

        if(isEmptyString(trimmedLabel)){
            return {
                isValid:false, error: TAG_VALIDATION_MESSAGES.EMPTY
            }
        }

        if(trimmedLabel.length > 20){
            return {
                isValid:false, error: TAG_VALIDATION_MESSAGES.TOO_LONG
            }
        }

        if(trimmedLabel.length < 3){
            return {
                isValid:false, error: TAG_VALIDATION_MESSAGES.TOO_SHORT
            }
        }

        const isDuplicate = allTags.some(tag => 
            tag.id !== editingTagId && 
            tag.label.toLowerCase() === trimmedLabel.toLowerCase()
            );

        if (isDuplicate) {
            return { isValid: false, error: TAG_VALIDATION_MESSAGES.DUPLICATE };
        }

        return { isValid: true };
    },
    

    exists: (label:string, allTags: Tag[],excludeId?: string):boolean => {
        const searchlabel = label.toLowerCase().trim();
        return allTags.some(tag => 
            tag.id !== excludeId && 
            tag.label.toLowerCase() === searchlabel);
    },

    create: async (
        userId: string,
        label: string, 
        allTags: Tag[],
        color: string = "#3b82f6"
        ):Promise<Tag> => {
        
        const result = TagService.validation(label, allTags);

        if(!result.isValid){throw new Error(result.error)}
        if(TagService.exists(label, allTags)){
            throw new Error(TAG_VALIDATION_MESSAGES.DUPLICATE)
        };
                
        const newTag = { 
            id: uuidv4(),
             userId: userId,
            label: label.trim(),
            color: color,
            }
            await TagDb.insert(newTag);
            return newTag;
    },

    update: async (
        userId: string,
        tagId: string, 
        allTags: Tag[],
        changes: Partial<Tag>
        ): Promise<void> => {
            if(changes.label !== undefined){
                const result = TagService.validation(changes.label, allTags, tagId);
                if(!result.isValid){throw new Error(result.error)}

               if (TagService.exists(changes.label, allTags, tagId)) {
                    throw new Error(TAG_VALIDATION_MESSAGES.DUPLICATE);
                }
            }
            
            try {
                await TagDb.update(userId,tagId, changes);
                } catch (error) {
                console.error("update tag failed:", error);
                throw error;
                }

    },

    delete: async(userId: string,tagId:string):Promise<void> => {
        await TagDb.delete(userId,tagId);
    }

};


