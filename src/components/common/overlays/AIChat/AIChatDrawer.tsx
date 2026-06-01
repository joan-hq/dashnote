'use client';
import { useEffect, useRef } from 'react';
import { useAIChat } from '@/components/common/overlays/AIChat/useAIChat';
import { useNoteContext } from '@/features/notes/context/noteContext';


interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  noteContent: string;
  onCreateNote: (title: string, content: string) => void;
}

export const AIChatDrawer = ({ isOpen, onClose, onCreateNote }: AIChatDrawerProps) => {
  const { selectedNote, updateNote } = useNoteContext();

  const {
    messages,
    input,
    setInput,
    loading,
    handleSend,
    clearChat,
    handleSummarizeAndSave,
    handleAppendToNote
  } = useAIChat({
    noteContent: selectedNote?.content ?? '',
    onCreateNote
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (!isOpen) clearChat();
  }, [isOpen, clearChat]);

  useEffect(() => {
    if (isOpen) clearChat();
  }, [selectedNote?.id, clearChat]);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const viewport = window.visualViewport;
        const drawer = document.getElementById('ai-drawer');
        if (drawer) {
          drawer.style.height = `${viewport.height}px`;
          drawer.style.top = `${viewport.offsetTop}px`;
        }
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  if (!isOpen) return null;


  return (
    <div
      id="ai-drawer"
      className="fixed right-0 top-0 z-[1000] flex flex-col w-full md:w-[400px] border-l border-gray-100 overflow-hidden"
      style={{
        background: 'var(--surface)',
        color: 'var(--text-primary)',
        boxShadow: '-4px 0 24px rgba(30,58,138,0.08)',
        height: '100dvh',
        maxHeight: '-webkit-fill-available',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
        <h3 className="m-0 flex items-center gap-1.5 font-bold text-base">
          <span>✦</span> DashNote AI
        </h3>
        <button
          onClick={onClose}
          className="cursor-pointer bg-transparent border-none text-xl p-1 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          ✕
        </button>
      </div>

      {/* Summarize button */}
      {messages.length > 0 && (
        <div className="px-5 pt-3 pb-2 shrink-0">
          <button
            onClick={() => handleSummarizeAndSave(onClose)}
            disabled={loading}
            className="btn-primary w-full text-xs rounded-xl disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Summarizing & saving...</span>
              </>
            ) : (
              <><span>📝</span><span>Summarize and save to a note</span></>
            )}
          </button>
        </div>
      )}


      {/* Appent to Note： */}
      {messages.length > 0 && selectedNote && (
        <div className="px-5 pb-2 shrink-0">
          <button
            onClick={() => handleAppendToNote(
              selectedNote.content,
              selectedNote.id,
              updateNote,
              onClose
            )}
            disabled={loading}
            className="btn-primary w-full text-xs rounded-xl disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
            style={{ background: 'var(--secondary)', color: 'var(--primary)' }}
          >
            <span>➕</span>
            <span>Append to current note</span>
          </button>
        </div>
      )}

      {/* Chat content ← ref */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-5 py-3 space-y-3 min-h-0"
      >
        {messages.length === 0 && (
          <div
            className="text-sm leading-relaxed p-3 rounded-xl border"
            style={{
              background: 'var(--ghost-hover)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <p className="font-semibold m-0 mb-1" style={{ color: 'var(--text-primary)' }}>
              Hey, how can I help you:
            </p>
            <ul className="list-disc pl-4 m-0 space-y-0.5 text-xs">
              <li>✨ Summarize your note</li>
              <li>💡 Brainstorm ideas</li>
            </ul>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <span
              className="inline-block px-3.5 py-2 rounded-2xl max-w-[85%] text-sm leading-relaxed break-words shadow-sm"
              style={
                m.role === 'user'
                  ? { backgroundColor: 'var(--primary)', color: '#fff', borderTopRightRadius: 4 }
                  : { backgroundColor: 'var(--secondary)', color: 'var(--text-primary)', borderTopLeftRadius: 4 }
              }
            >
              {m.content}
            </span>
          </div>
        ))}

        {loading && (
          <div className="text-xs italic flex items-center gap-1.5 pl-1" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-secondary)' }} />
            Thinking...
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex gap-2 px-5 py-4 border-t border-gray-100 shrink-0"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask something..."
          disabled={loading}
          rows={1}
          className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all disabled:opacity-60 resize-none overflow-hidden"
          style={{
            background: 'var(--ghost-hover)',
            border: '1.5px solid var(--border)',
            color: 'var(--text-primary)',
            maxHeight: '120px',
            overflowY: 'auto',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="btn-primary px-4 rounded-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          Send
        </button>
      </div>
    </div>
  );
};