'use client'

import { useEffect, useState, useMemo, useCallback } from "react";
import {Note} from '@/features/notes/types/noteType';
import { getAllNotesAction,
         createNoteAction, 
         updateNoteAction, 
         deleteNoteAction,
      permanentlyDeleteNoteAction } from '../actions/noteActions';


/**
 * 1. load all note
 * 2. actions
 *  2.1 create new notes
 *  2.2 update title, content, tags, status
 *  2.3 delete
 *  2.4 sort by edit, or name
 *  2.5 filter by searchquery or tag
 */

export const useNotes = () => {
   const [notes, setNotes] = useState<Note[]>([]);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);
   const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');

   const [searchQuery,setSearchQuery] = useState("");
   const [filterTagId, setFilterTagId] = useState<string | null>(null);
   const [filterStatus, setFilterStatus] = useState<'all' | 'archived' | 'trashed'>('all')
   const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
   const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

   const selectedNote = notes.find(note => note.id === selectedNoteId) ?? null;

   const fetchNotes = useCallback(async () => {
      console.log('fetchNotes called'); 
       console.trace();
      setStatus('loading');

      try {
         const data = await getAllNotesAction();
         console.log(' Fetch Note data', data);
         setNotes(data);
         setStatus('success')
      } catch (error) {
         setStatus('error');
            const message = error instanceof Error ? error.message : 'Fail to fetch tags';
            setErrorMessage(message);
      };
   }, [])

   useEffect(() => {
      console.log('useEffect triggered');

      let isMounted = true;

      const loadData = async () => {
         await fetchNotes();
         if(!isMounted) return;
      };
     loadData();

      return () => {
         isMounted = false; 
      }

   }, [fetchNotes]);


   const createNote = useCallback(async (title?: string, content?: string)=>{

      const isAiAction = !!(title || content);

      if(!isAiAction){
          const emptyNote = notes.find(note => !note.title && !note.content && note.status === 'active');
         if(emptyNote){
            setSelectedNoteId(emptyNote.id);
            return emptyNote;
         }
      }

     
      try{
         const newNote = await createNoteAction(title, content);
         setNotes((prev => [newNote, ...prev]));
         setSelectedNoteId(newNote.id);
         return newNote; 
      }catch(error){
         const message = error instanceof Error ? error.message : "Create failed";
         setErrorMessage(message);
      };
   }, [notes]);

   const updateNote = useCallback(async (id: string, changes: Partial<Note>) : Promise<void> => {
       console.log('updateNote called', id, changes);
      const previousNotes = [...notes];
      setNotes(prev => prev.map(note => note.id === id ? {...note, ...changes, lastEdit: new Date().toISOString()} :  note));

      try{
         console.log('before updateNoteAction');
         await updateNoteAction(id,changes);
      }catch(error){
         setNotes(previousNotes);
         const message = error instanceof Error ? error.message : "Update failed";
         setErrorMessage(message)
      };
   }, [notes]);

   const deleteNote = useCallback(async (id: string) => {
      const previousNotes = [...notes];
      setNotes(prev => prev.filter(n => n.id !== id));
      
      try {
         await deleteNoteAction(id);
      } catch (error) {
         setNotes(previousNotes);
         const message = error instanceof Error ? error.message : "Delete failed";
         setErrorMessage(message)
  
      }
   }, [notes]);

   // const permanentlyDeleteNote = useCallback(async (id: string) => {
   //    console.log('before delete, notes:', notes.length);
   //    const previousNotes = [...notes];
   //    setNotes(prev => {
   //       console.log('after delete, notes:', prev.filter(n => n.id !== id).length);
   //       return prev.filter(n => n.id !== id);
   //    });
   //    setSelectedNoteId(null);
      
   //    try {
   //       await permanentlyDeleteNoteAction(id);
   //    } catch(error) {
   //       setNotes(previousNotes);
   //       const message = error instanceof Error ? error.message : "Delete failed";
   //       setErrorMessage(message);
   //    }
   // }, [notes]);

   const permanentlyDeleteNote = useCallback(async (id: string) => {
    const previousNotes = [...notes];
    setNotes(prev => prev.filter(n => n.id !== id));
    setSelectedNoteId(null);
    
    try {
        await fetch(`/notes-api/delete/${id}`, { method: 'DELETE' });
    } catch(error) {
        setNotes(previousNotes);
        const message = error instanceof Error ? error.message : "Delete failed";
        setErrorMessage(message);
    }
}, [notes]);


   const selectNote = useCallback(async (id: string | null) => {
    
    if (selectedNoteId) {
        const currentNote = notes.find(n => n.id === selectedNoteId);
        if (currentNote && !currentNote.title && !currentNote.content) {
            setNotes(prev => prev.filter(n => n.id !== selectedNoteId));
            deleteNoteAction(selectedNoteId).catch(console.error);
        }
    }
    setSelectedNoteId(id);
}, [selectedNoteId, notes]);


   const filteredAndSortedNotes = useMemo(()=>{
   
      let result = notes.filter(note => {
         if(filterStatus === 'all') return note.status === 'active';
         return note.status === filterStatus
      })

      if(searchQuery){
         result = result.filter( note => note.title.toLowerCase().includes(searchQuery.toLowerCase()) 
         || note.content.toLowerCase().includes(searchQuery.toLowerCase()) );
      }

      if(filterTagId){
         result = result.filter( note => note.tags.includes(filterTagId));
      };

      return result.sort((a,b) => {
         if(sortBy === 'name') return a.title.localeCompare(b.title);
         const dateA = a.lastEdit ? new Date(a.lastEdit).getTime() : 0;
         const dateB = b.lastEdit ? new Date(b.lastEdit).getTime() : 0;
         return dateB - dateA;
      })
     
   },[notes, searchQuery,filterTagId,sortBy,filterStatus]);
   
   const countsNote = useMemo(() => {
      console.log('countsNote recalculated, trashed:', notes.filter(note => note.status === 'trashed').length);
      return {
         all: notes.filter(note=> note.status === 'active').length,
         archived: notes.filter(note=> note.status === 'archived').length,
         trashed: notes.filter(note=> note.status === 'trashed').length,
      }
   }, [notes])



   return {
      notes: filteredAndSortedNotes,
      isLoading: status === 'loading',
      error: errorMessage,
      setSearchQuery,
      filterTagId,
      setFilterTagId,
      filterStatus,
      setFilterStatus,
      countsNote,
      setSortBy,
      selectedNoteId,
      setSelectedNoteId,
      selectedNote,
      selectNote,
      createNote,
      updateNote,
      deleteNote,
      permanentlyDeleteNote,
      setNotes,
      refresh: fetchNotes,
      
   }

};

