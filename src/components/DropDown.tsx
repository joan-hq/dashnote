import { ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DropDownItem {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
}

interface DropDownProps {
    trigger: (onClick: (e: React.MouseEvent<HTMLElement>) => void) => React.ReactNode;
    items: DropDownItem[];
    header?: ReactNode;
    menuItemClassName?: string;
}

export const DropDown = ({ trigger, items, header, menuItemClassName }: DropDownProps) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current && !menuRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTriggerClick = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({ top: rect.bottom + 4, left: rect.left });
        setOpen(prev => !prev);
    };

    return (
        <div className="relative" ref={triggerRef}>
            {trigger(handleTriggerClick)}
            {open && typeof document !== 'undefined' && createPortal(
                <div
                    ref={menuRef}
                    className="fixed min-w-[160px] rounded-xl shadow-lg z-50 py-1 border border-gray-100"
                    style={{ background: 'var(--surface)', top: position.top, left: position.left }}
                >
                    {header}
                    {items.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => { item.onClick(); setOpen(false); }}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors cursor-pointer border-none bg-transparent ${menuItemClassName ?? ''}`}
                            style={{ color: 'var(--text-primary)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ghost-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            {item.icon && <span>{item.icon}</span>}
                            {item.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
};