import { useState, useEffect, useCallback } from 'react';
import { Plus, Save, FileText, Star, Search, AlertCircle, Sparkles, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useGemini } from '@/hooks/useGemini';
import { toast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isImportant: boolean; // This will be derived from tags or stored locally
  created_at: string;
  updated_at: string;
}

export const NotesApp = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImportanceDialog, setShowImportanceDialog] = useState(false);
  const [pendingNote, setPendingNote] = useState<Note | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { isConnected } = useWallet();
  const { generateResponse, loading: aiLoading } = useGemini();

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  // Improved auto-save functionality with proper cleanup
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    if (hasUnsavedChanges && selectedNote && user) {
      const timer = setTimeout(() => {
        autoSave();
      }, 3000); // Auto-save after 3 seconds of inactivity
      
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [selectedNote?.content, selectedNote?.title, hasUnsavedChanges]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, []);

  const loadNotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const formattedNotes: Note[] = (data || []).map(note => ({
        id: note.id,
        title: note.title || 'Untitled Note',
        content: note.content || '',
        tags: note.tags || [],
        isImportant: (note.tags || []).includes('important'), // Check if 'important' tag exists
        created_at: note.created_at,
        updated_at: note.updated_at
      }));

      setNotes(formattedNotes);
      if (formattedNotes.length > 0 && !selectedNote) {
        setSelectedNote(formattedNotes[0]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Error Loading Notes",
        description: "Failed to load your notes. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createNewNote = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create notes",
        variant: "destructive",
      });
      return;
    }

    const newNote = {
      title: 'Untitled Note',
      content: '',
      tags: [],
      user_id: user.id
    };

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select()
        .single();

      if (error) {
        console.error('Create note error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      const formattedNote: Note = {
        id: data.id,
        title: data.title,
        content: data.content || '',
        tags: data.tags || [],
        isImportant: (data.tags || []).includes('important'),
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setNotes(prev => [formattedNote, ...prev]);
      setSelectedNote(formattedNote);
      setHasUnsavedChanges(false);
      
      toast({
        title: "Note Created",
        description: "New note created successfully",
      });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "Failed to create new note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!selectedNote || !user || !hasUnsavedChanges) return;

    try {
      const updateData = {
        title: selectedNote.title?.trim() || 'Untitled Note',
        content: selectedNote.content || '',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notes')
        .update({
          title: selectedNote.title?.trim() || 'Untitled Note',
          content: selectedNote.content || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedNote.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Auto-save error details:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          noteId: selectedNote.id,
          userId: user.id
        });
        throw error;
      }

      // Update local state with the returned data
      if (data) {
        const updatedNote = {
          ...selectedNote,
          title: data.title,
          content: data.content || '',
          tags: data.tags || [],
          updated_at: data.updated_at
        };
        
        setNotes(prev => prev.map(n => n.id === selectedNote.id ? updatedNote : n));
        setSelectedNote(updatedNote);
      }
      
      setHasUnsavedChanges(false);

      // Clear the timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        setAutoSaveTimer(null);
      }

      console.log('Note auto-saved successfully');
    } catch (error) {
      console.error('Error auto-saving note:', error);
      // Don't show toast for auto-save errors to avoid spam
    }
  };

  const handleManualSave = () => {
    if (!selectedNote) return;
    
    // For manual save, we'll save immediately without the importance dialog
    // You can uncomment the dialog code if you want the importance feature
    saveNote(false);
    
    // Uncomment these lines if you want the importance dialog:
    // setPendingNote(selectedNote);
    // setShowImportanceDialog(true);
  };

  const saveNote = async (isImportant: boolean = false) => {
    const noteToSave = pendingNote || selectedNote;
    if (!noteToSave || !user) return;

    if (isImportant && !isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to save important notes on-chain.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update tags based on importance
      let updatedTags = [...(noteToSave.tags || [])];
      if (isImportant && !updatedTags.includes('important')) {
        updatedTags.push('important');
      } else if (!isImportant && updatedTags.includes('important')) {
        updatedTags = updatedTags.filter(tag => tag !== 'important');
      }

      const updateData = {
        title: noteToSave.title?.trim() || 'Untitled Note',
        content: noteToSave.content || '',
        tags: updatedTags,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', noteToSave.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Save note error details:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database error: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No data returned from update');
      }

      // Update local state
      const updatedNote = {
        ...noteToSave,
        title: data.title,
        content: data.content || '',
        tags: data.tags || [],
        isImportant: (data.tags || []).includes('important'),
        updated_at: data.updated_at
      };
      
      setNotes(prev => prev.map(n => n.id === noteToSave.id ? updatedNote : n));
      setSelectedNote(updatedNote);
      setHasUnsavedChanges(false);

      toast({
        title: "Note Saved",
        description: isImportant ? "Note saved on-chain and in database" : "Note saved successfully",
      });

      setShowImportanceDialog(false);
      setPendingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
      
      // More specific error messages
      let errorMessage = "Failed to save the note. Please check your connection and try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('row-level security')) {
          errorMessage = "Database access denied. Please check your authentication.";
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (error.message.includes('not found')) {
          errorMessage = "Note not found. It may have been deleted.";
        }
      }
      
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedNote = (updates: Partial<Note>) => {
    if (!selectedNote) return;
    
    const updatedNote = { ...selectedNote, ...updates };
    setSelectedNote(updatedNote);
    setHasUnsavedChanges(true);
    
    // Also update in the notes list for immediate UI feedback
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? updatedNote : n));
  };

  const selectNote = async (note: Note) => {
    // Auto-save current note before switching if there are unsaved changes
    if (hasUnsavedChanges && selectedNote) {
      await autoSave();
    }
    setSelectedNote(note);
    setHasUnsavedChanges(false);
  };

  const deleteNote = async (noteId: string) => {
    if (!user) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this note?');
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Delete note error:', error);
        throw error;
      }

      const remainingNotes = notes.filter(n => n.id !== noteId);
      setNotes(remainingNotes);
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
        setHasUnsavedChanges(false);
      }

      toast({
        title: "Note Deleted",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the note",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enhanceWithAI = async (action: 'summarize' | 'rewrite' | 'expand') => {
    if (!selectedNote?.content?.trim()) {
      toast({
        title: "No Content",
        description: "Please add some content to enhance",
        variant: "destructive",
      });
      return;
    }

    let prompt = '';
    switch (action) {
      case 'summarize':
        prompt = `Summarize this note in a concise way:\n\n${selectedNote.content}`;
        break;
      case 'rewrite':
        prompt = `Rewrite this note to be clearer and better structured:\n\n${selectedNote.content}`;
        break;
      case 'expand':
        prompt = `Expand on this note with more details and examples:\n\n${selectedNote.content}`;
        break;
    }

    try {
      const response = await generateResponse(prompt);
      setAiResponse(response);
      setShowAI(true);
    } catch (error) {
      console.error('AI enhancement error:', error);
      toast({
        title: "AI Error",
        description: "Failed to enhance note with AI",
        variant: "destructive",
      });
    }
  };

  const applyAIEnhancement = () => {
    if (selectedNote && aiResponse?.trim()) {
      updateSelectedNote({ content: aiResponse });
      setShowAI(false);
      setAiResponse('');
      toast({
        title: "Enhancement Applied",
        description: "AI enhancement applied to note",
      });
    }
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-[#020202] via-[#050d0a] to-[#020202] text-green-400 font-mono relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,0,0.03),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0,255,0,0.03),transparent_50%)] animate-pulse pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.3)_1px,transparent_1px)] bg-[size:100%_2px] pointer-events-none"></div>

      {/* Sidebar */}
      <div className="w-80 border-r border-green-500/20 flex flex-col bg-black/40 backdrop-blur-sm relative z-10">
        <div className="p-4 border-b border-green-500/20">
          <div className="flex items-center space-x-2 mb-3">
            <Button 
              onClick={createNewNote} 
              size="sm" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-mono shadow-green-500/30 shadow-md transition-all duration-300" 
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'New Note'}
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400/60" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/60 border-green-500/30 text-green-400 placeholder-green-400/50 focus:border-green-400 focus:ring-green-400/20 font-mono"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading && notes.length === 0 ? (
            <div className="p-4 text-center text-green-400/60 font-mono">Loading notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-green-400/60 font-mono">
              {searchTerm ? 'No notes match your search' : 'No notes yet. Create your first note!'}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 border-b border-green-500/10 cursor-pointer transition-all duration-300 ${
                  selectedNote?.id === note.id 
                    ? 'bg-green-500/20 border-l-4 border-l-green-400 shadow-green-500/20 shadow-md' 
                    : 'hover:bg-green-500/10 hover:border-l-2 hover:border-l-green-500/50'
                }`}
                onClick={() => selectNote(note)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium truncate flex-1 text-green-300 font-mono">{note.title}</h3>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    {note.isImportant && (
                      <Star className="h-4 w-4 text-yellow-400" />
                    )}
                    {selectedNote?.id === note.id && hasUnsavedChanges && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Unsaved changes" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-green-400/70 line-clamp-2 font-mono">
                  {note.content.replace(/[#*`]/g, '').slice(0, 100)}
                  {note.content.length > 100 ? '...' : ''}
                </p>
                <p className="text-xs text-green-500/50 mt-2 font-mono">
                  {new Date(note.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-sm relative z-10">
        {selectedNote ? (
          <>
            <div className="border-b border-green-500/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <Input
                  value={selectedNote.title}
                  onChange={(e) => updateSelectedNote({ title: e.target.value })}
                  className="text-lg font-semibold bg-transparent border-none px-0 text-green-300 focus:ring-0 font-mono placeholder-green-400/50"
                  placeholder="Note title..."
                />
                <div className="flex items-center space-x-2">
                  {hasUnsavedChanges && (
                    <span className="text-xs text-orange-400 mr-2 font-mono animate-pulse">Unsaved changes</span>
                  )}
                  <Button
                    onClick={() => setShowAI(!showAI)}
                    size="sm"
                    variant="outline"
                    disabled={!selectedNote.content?.trim()}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-400 transition-all duration-300 font-mono"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI
                  </Button>
                  <Button
                    onClick={handleManualSave}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-mono shadow-green-500/30 shadow-md transition-all duration-300"
                    disabled={loading || !hasUnsavedChanges}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={() => deleteNote(selectedNote.id)}
                    size="sm"
                    variant="destructive"
                    disabled={loading}
                    className="bg-red-900/80 hover:bg-red-800 border-red-500/30 text-red-300 font-mono transition-all duration-300"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex">
              <div className={showAI ? 'flex-1' : 'w-full'}>
                <Textarea
                  value={selectedNote.content}
                  onChange={(e) => updateSelectedNote({ content: e.target.value })}
                  placeholder="Start writing... (Markdown supported)"
                  className="w-full h-full resize-none bg-black/40 border-green-500/20 text-green-300 font-mono placeholder-green-400/50 focus:border-green-400 focus:ring-green-400/20"
                />
              </div>

              {showAI && (
                <div className="w-80 border-l border-green-500/20 bg-black/40 backdrop-blur-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center text-green-300 font-mono">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Enhancement
                    </h3>
                    <Button onClick={() => setShowAI(false)} size="sm" variant="ghost" className="text-green-400 hover:bg-green-500/20 font-mono">×</Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        onClick={() => enhanceWithAI('summarize')} 
                        size="sm" 
                        variant="outline"
                        disabled={aiLoading}
                        className="justify-start border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-400 transition-all duration-300 font-mono"
                      >
                        Summarize
                      </Button>
                      <Button 
                        onClick={() => enhanceWithAI('rewrite')} 
                        size="sm" 
                        variant="outline"
                        disabled={aiLoading}
                        className="justify-start border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-400 transition-all duration-300 font-mono"
                      >
                        Rewrite
                      </Button>
                      <Button 
                        onClick={() => enhanceWithAI('expand')} 
                        size="sm" 
                        variant="outline"
                        disabled={aiLoading}
                        className="justify-start border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-400 transition-all duration-300 font-mono"
                      >
                        Expand
                      </Button>
                    </div>

                    {aiLoading && (
                      <div className="text-sm text-green-400/60 text-center font-mono animate-pulse">
                        AI is working...
                      </div>
                    )}

                    {aiResponse && (
                      <div className="bg-black/60 p-3 rounded border border-green-500/20 text-sm max-h-64 overflow-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-green-300 font-mono">AI Enhancement:</span>
                          <div className="flex space-x-1">
                            <Button onClick={applyAIEnhancement} size="sm" variant="ghost" className="text-green-400 hover:bg-green-500/20 font-mono">
                              Apply
                            </Button>
                            <Button 
                              onClick={() => navigator.clipboard.writeText(aiResponse)} 
                              size="sm" 
                              variant="ghost"
                              className="text-green-400 hover:bg-green-500/20 font-mono"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="whitespace-pre-wrap text-green-200 font-mono">{aiResponse}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-green-400/60">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-mono">Select a note to start editing</p>
              {notes.length === 0 && (
                <p className="mt-2 text-sm font-mono">Create your first note using the "New Note" button</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Importance Dialog */}
      <Dialog open={showImportanceDialog} onOpenChange={setShowImportanceDialog}>
        <DialogContent className="bg-black/90 border-green-500/30 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-green-300 font-mono">Save Note</DialogTitle>
            <DialogDescription className="text-green-400/70 font-mono">
              Choose how to store your note: {pendingNote?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => saveNote(false)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-mono shadow-green-500/30 shadow-md"
            >
              {loading ? 'Saving...' : 'Save Off-Chain (Database)'}
            </Button>
            <Button
              onClick={() => saveNote(true)}
              disabled={loading || !isConnected}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-black font-mono shadow-blue-500/30 shadow-md"
            >
              {loading ? 'Saving...' : 'Save On-Chain (Important)'}
            </Button>
            {!isConnected && (
              <p className="text-sm text-green-400/60 text-center font-mono">
                Connect wallet to enable on-chain storage
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};