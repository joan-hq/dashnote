'use client';

import { useState,useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface UseAIChatOptions {
  noteContent: string;
  onCreateNote?: (title: string, content: string) => void;
}

export function useAIChat({ noteContent, onCreateNote }: UseAIChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages,
          noteContext: noteContent
        }),
      });

      const data = await res.json();
      let replyContent = '';

      if (data && typeof data === 'object') {
        replyContent = data.text || data.content || (data.text?.text) || '';
      }

      if (replyContent) {
        setMessages(prev => [...prev, {
          id: 'assistant-' + Date.now(),
          role: 'assistant',
          content: replyContent
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: 'assistant-err-' + Date.now(),
          role: 'assistant',
          content: `⚠️ Cannot get text, backend return: ${JSON.stringify(data)}`
        }]);
      }
    } catch (error: any) {
      console.error("AI request error:", error);
      setMessages(prev => [...prev, {
        id: 'assistant-catch-' + Date.now(),
        role: 'assistant',
        content: `❌ network connect: ${error.message || 'Unknown Error'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 💡 on success, close drawer
  const handleSummarizeAndSave = async (onSuccess?: () => void) => {
    if (messages.length === 0 || summarizing) return;

    setSummarizing(true);
    setLoading(true); // loading status
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          noteContext: noteContent,
          isSummarizeAction: true 
        })
      });

      const data = await res.json();
      let isSuccess = false;
      
      if (data && data.title && data.content) {
        onCreateNote?.(data.title, data.content);
        isSuccess = true;
      } else if (data.text) {
        const lines = data.text.split('\n');
        const title = lines[0].replace('#', '').trim() || 'AI Summary';
        const content = lines.slice(1).join('\n').trim();
        onCreateNote?.(title, content);
        isSuccess = true;
      }

      // 💡 note create success, close drawer
      if (isSuccess && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("总结并保存笔记失败:", err);
    } finally {
      setSummarizing(false);
      setLoading(false);
    }
  };

  const handleAppendToNote = async (
  currentContent: string,
  noteId: string,
  onUpdate: (id: string, changes: Partial<Note>) => Promise<void>,
  onSuccess?: () => void
) => {
  if (messages.length === 0 || loading) return;
  setLoading(true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        noteContext: noteContent,
        isSummarizeAction: true
      })
    });

    const data = await res.json();
    if (data?.content) {
      const appendedContent = `${currentContent}\n\n---\n✨ AI Append · ${new Date().toLocaleDateString()}\n${data.content}`;
      await onUpdate(noteId, { content: appendedContent });
      onSuccess?.();
    }
  } catch (err) {
    console.error('Append failed:', err);
  } finally {
    setLoading(false);
  }
  };

  const clearChat = useCallback(() => {
    setMessages([]);
    setInput('');
  }, []);

  return {
    messages,
    setMessages,
    input,
    setInput,
    loading: loading || summarizing, 
    handleSend,
    clearChat,
    handleSummarizeAndSave,
    handleAppendToNote,
  };
}