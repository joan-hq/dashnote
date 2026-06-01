import { Chip } from '@mui/material';
import { Tag } from '@/features/tags/types/tagType';
import { Archive as ArchiveIcon, AccessTime as AccessTimeIcon } from "@mui/icons-material";
import { formatRelativeTime } from '@/utils/date';



interface NoteCardProps {
    title: string,
    tags: Tag[],
    lastEdit: string,
    isArchived: boolean,
    isSelected: boolean,
    selectedTagId?: string | null,
    handleNoteCardClick: () => void,
    tagDisplayLimit: number,
};

export const NoteCard = ({ title, tags, tagDisplayLimit, lastEdit, isArchived, isSelected, selectedTagId, handleNoteCardClick }: NoteCardProps) => {

    const sortedTags = selectedTagId
        ? [...tags].sort((a, b) => {
            if (a.id === selectedTagId) return -1;
            if (b.id === selectedTagId) return 1;
            return 0;
        })
        : tags;

    const tagsToShow = sortedTags.slice(0, tagDisplayLimit);
    const tagsHide = sortedTags.length - tagDisplayLimit;

    return (
        <div
            onClick={handleNoteCardClick}
            className={`note-card ${isSelected
                ? 'note-card-active'
                : ''
                }`}
        >
            <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-[--color-text-primary] truncate">{title}</span>
                {isArchived && <ArchiveIcon fontSize="small" style={{ color: 'var(--text-secondary)' }} />}
            </div>

            {tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-2">
                    {tagsToShow.map((tag) => {
                        const isTagSelected = tag.id === selectedTagId;
                        return (
                            <Chip key={tag.id} label={tag.label} size="small"
                                sx={isTagSelected ? {
                                    bgcolor: 'var(--color-tag-selected-bg)',
                                    color: 'var(--color-tag-selected-text)',
                                    '& .MuiChip-label': { color: 'var(--color-tag-selected-text)' }
                                } : {
                                    bgcolor: 'var(--color-tag-default-bg)',
                                    color: 'var(--color-tag-default-text)',
                                    '& .MuiChip-label': { color: 'var(--color-tag-default-text)' },

                                    '&:hover': {
                                        bgcolor: 'var(--color-bg-hover)',
                                    }
                                }} />
                        )
                    })}
                    {tagsHide > 0 && (
                        <span className="text-xs text-[--color-text-muted] self-center ml-0.5">+{tagsHide}</span>
                    )}
                </div>
            )}

            <div className="flex items-center gap-1 text-xs text-[--color-text-muted]">
                <AccessTimeIcon style={{ fontSize: 12 }} />
                <span>{formatRelativeTime(lastEdit)}</span>
            </div>
        </div>
    );
};