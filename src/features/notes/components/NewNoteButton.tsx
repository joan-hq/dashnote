import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useNoteContext } from "../context/noteContext";
import { useRouter } from 'next/navigation';

export const NewNoteButton = () => {
    const router = useRouter();
    const { createNote, filterStatus, selectedNoteId, notes, permanentlyDeleteNote } = useNoteContext();
    if (filterStatus !== 'all') return null;

    const handleCreateNote = async () => {
        if (selectedNoteId) {
            const currentNote = notes.find(n => n.id === selectedNoteId);
            if (currentNote && !currentNote.title && !currentNote.content) {
                await permanentlyDeleteNote(selectedNoteId);
            }
        }

        const newNote = await createNote();
        if (newNote?.id) {
            router.push(`/dashboard/${newNote.id}`);
        }
    };

    return (
        <button
            onClick={() => handleCreateNote()}
            className="
            flex w-full items-center gap-2 px-4 py-2.5 
            rounded-full text-sm font-medium 
            active:scale-95 transition-all
             text-white"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
        >

            <AddOutlinedIcon fontSize="small" />
            New Note
        </button>
    );
};