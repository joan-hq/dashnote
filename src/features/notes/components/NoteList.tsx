import { NoteCard } from "./NoteCard";
import { useNoteContext } from "../context/noteContext";
import { findManyObjectsByIds } from "@/utils/array";
import { Typography, Box } from "@mui/material";
import { useRouter } from 'next/navigation';


export const NoteList = () => {
    const router = useRouter();
    const { notes, tags, isLoading, selectNote, selectedNoteId, filterTagId } = useNoteContext();
    console.log("notes", notes);
    if (isLoading) return <Typography sx={{ p: 2 }}>Loading...</Typography>;
    if (notes.length === 0) return (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.disabled' }}>
            <Typography variant="body2">No notes here</Typography>
        </Box>
    );

    return (<>
        <div className="flex flex-col p-2 gap-0.5">
            {notes.map(
                (note) => {
                    console.log("Note List lastEdit", note.lastEdit);
                    const displayTags = findManyObjectsByIds(note.tags, tags);
                    const isAi = note.type === "ai_summary";
                    const finalTags = isAi
                        ? [
                            { id: "ai-sync-tag", label: "AI Sync", color: "#d06262" },
                            ...displayTags
                        ]
                        : displayTags;


                    return (
                        <div key={note.id}>
                            <NoteCard
                                key={note.id}
                                title={isAi ? `🤖 ${note.date || ''} | ${note.title}` : note.title}
                                tags={finalTags}
                                tagDisplayLimit={3}
                                isArchived={note.status === 'archived'}
                                lastEdit={note.lastEdit}
                                handleNoteCardClick={() => router.push(`/dashboard/${note.id}`)}
                                selectedTagId={filterTagId}
                                isSelected={note.id === selectedNoteId || (!!filterTagId && note.tags.includes(filterTagId))}
                            />
                        </div>
                    );
                }
            )}
        </div>
    </>);
};
