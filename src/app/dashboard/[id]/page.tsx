'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNoteContext } from '@/features/notes/context/noteContext';
import { NoteDisplay } from '@/features/notes/views/NoteDisplay';
import { useState } from 'react';

export default function NoteDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { setSelectedNoteId, notes, selectedNoteId, permanentlyDeleteNote } = useNoteContext();
    const router = useRouter();
    // const [isAiOpen, setIsAiOpen] = useState(false);

    useEffect(() => {

        if (selectedNoteId && selectedNoteId !== id) {
            const prevNote = notes.find(n => n.id === selectedNoteId);
            if (prevNote && !prevNote.title && !prevNote.content) {
                permanentlyDeleteNote(selectedNoteId);
            }
        }

        setSelectedNoteId(id);

        const exists = notes.some(n => n.id === id);
        if (notes.length > 0 && !exists) {
            router.replace('/dashboard');
        }
    }, [id, notes]);

    return (
        <NoteDisplay />
    );
}