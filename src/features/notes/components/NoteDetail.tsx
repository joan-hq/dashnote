import { useRef, useEffect, useState } from "react";
import { NoteTagDisplay } from "./NoteTagDisplay";
import { Divider, Typography, TextareaAutosize } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MDEditor from '@uiw/react-md-editor';
import { useNoteContext } from "../context/noteContext";
import { findManyObjectsByIds } from "@/utils/array";
import { MarkdownEditor } from "@/features/notes/components/MarkdownEditor";
import { formatRelativeTime } from '@/utils/date';



interface NoteDetailProps {
    title: string,
    onTitleChange: (title: string) => void,
    content: string,
    onContentChange: (content: string) => void,
    lastEdit: string,

};

const Header = ({ title, onTitleChange }: Pick<NoteDetailProps, 'title' | 'onTitleChange'>) => {
    return (
        <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled Note"
            className="w-full text-2xl font-semibold outline-none bg-transparent 
            text-[--color-text-primary] placeholder:text-[--color-text-muted]"
        />
    );
};


const LastEditInfo = ({ lastEdit }: Pick<NoteDetailProps, 'lastEdit'>) => {
    const formattedDate = new Date(lastEdit).toLocaleString('en', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="flex items-center gap-1 text-xs text-[--color-text-muted]">
            <AccessTimeIcon sx={{ fontSize: 12 }} />
            <span>{formattedDate}</span>
        </div>
    );
};


// const Content = ({ content, onContentChange }: Pick<NoteDetailProps, 'content' | 'onContentChange'>) => {
//     return (
//         <MDEditor
//             value={content}
//             // onChange={() => onContentChange(e.target.value)}
//             onChange={(val) => onContentChange(val || "")}
//             // placeholder="Start writing..."
//             textareaProps={{
//                 placeholder: "Start writing..."
//             }}
//             preview="live"
//             height="100%"
//             // className="w-full min-h-full outline-none bg-transparent 
//             // text-[--color-text-primary] placeholder:text-[--color-text-muted] resize-none 
//             // text-sm leading-relaxed"
//             className="w-full h-full text-[--color-text-primary]"
//         />
//     );
// };


export const NoteDetail = () => {

    const { tags, updateNote, selectedNote, createTagAndAttachToNote } = useNoteContext();


    if (!selectedNote) {
        return (
            <div className="flex flex-col items-center justify-center 
             h-full text-[--color-text-muted] gap-2">
                <span className="text-5xl">📝</span>
                <Typography variant="h6">No note selected yet</Typography>
                <Typography variant="body2">Select a note from the list on the left to view its details.</Typography>
            </div>
        );
    }

    return (
        <div className="relative p-6 flex flex-col gap-3 h-full">

            <div className="flex flex-col gap-3 flex-shrink-0">
                <Header
                    title={selectedNote.title}
                    onTitleChange={(newTitle) => updateNote(selectedNote.id, { title: newTitle })}

                />
                <LastEditInfo lastEdit={formatRelativeTime(selectedNote.lastEdit)} />
                <NoteTagDisplay
                    allTags={tags}
                    linkedTags={findManyObjectsByIds(selectedNote.tags, tags)}
                    handleLinkedTag={(newTags) => updateNote(selectedNote.id, { tags: newTags.map(t => t.id) })}
                    handleConfirm={(newTagName) => createTagAndAttachToNote(selectedNote.id, newTagName)}
                />
            </div>

            <div className="flex-1 min-h-0">
                <MarkdownEditor
                    value={selectedNote.content}
                    onChange={(newContent) => updateNote(selectedNote.id, { content: newContent })}
                />
            </div>

        </div>
    );
};