import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, Clock, ArrowLeft, Check, X, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import apiService from './services/api';

const SYNC_ENABLED = process.env.REACT_APP_API_URL ? true : false;

export default function NotesManager() {
  const [notes, setNotes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: '#E9D5FF',
    images: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isOnline, setIsOnline] = useState(SYNC_ENABLED);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const colors = [
    '#FFFFFF',
    '#FAE8C8',
    '#E9D5FF',
    '#DBEAFE',
    '#FCE7F3',
    '#F3E8FF',
    '#E0E7FF',
  ];

  // Sync notes from server
  const syncFromServer = useCallback(async () => {
    if (!SYNC_ENABLED) return;
    
    setIsSyncing(true);
    setSyncError(null);
    try {
      const serverNotes = await apiService.getNotes();
      const formattedNotes = serverNotes.map(note => ({
        id: note._id,
        title: note.title,
        content: note.content,
        color: note.color,
        images: note.images || [],
        date: note.date,
      }));
      setNotes(formattedNotes);
      localStorage.setItem('notes', JSON.stringify(formattedNotes));
      setIsOnline(true);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError('Failed to sync');
      setIsOnline(false);
      // Fallback to local storage
      const savedNotes = localStorage.getItem('notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Load notes on mount
  useEffect(() => {
    if (SYNC_ENABLED) {
      syncFromServer();
    } else {
      const savedNotes = localStorage.getItem('notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    }
  }, [syncFromServer]);

  // Save notes to local storage
  useEffect(() => {
    if (!SYNC_ENABLED && (notes.length > 0 || notes.length === 0)) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              { id: Date.now() + Math.random(), url: reader.result },
            ],
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const handleSave = async () => {
    if (
      formData.title.trim() ||
      formData.content.trim() ||
      formData.images.length > 0
    ) {
      const noteData = {
        title: formData.title.trim() || 'Tanpa Judul',
        content: formData.content,
        color: formData.color,
        images: formData.images,
      };

      if (SYNC_ENABLED && isOnline) {
        setIsSyncing(true);
        try {
          if (editingNote) {
            const updated = await apiService.updateNote(editingNote.id, noteData);
            setNotes(notes.map((note) =>
              note.id === editingNote.id
                ? { ...note, ...noteData, id: updated._id, date: updated.date, images: updated.images }
                : note
            ));
          } else {
            const created = await apiService.createNote(noteData);
            const newNote = {
              id: created._id,
              ...noteData,
              images: created.images,
              date: created.date,
            };
            setNotes([newNote, ...notes]);
          }
        } catch (error) {
          console.error('Save error:', error);
          setSyncError('Failed to save');
          // Fallback to local
          saveLocally(noteData);
        } finally {
          setIsSyncing(false);
        }
      } else {
        saveLocally(noteData);
      }
      handleCancel();
    }
  };

  const saveLocally = (noteData) => {
    if (editingNote) {
      setNotes(
        notes.map((note) =>
          note.id === editingNote.id
            ? { ...note, ...noteData, date: new Date().toISOString() }
            : note
        )
      );
    } else {
      const newNote = {
        id: Date.now(),
        ...noteData,
        date: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color,
      images: note.images || [],
    });
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (SYNC_ENABLED && isOnline) {
      setIsSyncing(true);
      try {
        await apiService.deleteNote(id);
        setNotes(notes.filter((note) => note.id !== id));
      } catch (error) {
        console.error('Delete error:', error);
        setSyncError('Failed to delete');
      } finally {
        setIsSyncing(false);
      }
    } else {
      setNotes(notes.filter((note) => note.id !== id));
    }
    setDeleteConfirm(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', color: '#E9D5FF', images: [] });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isAdding) {
    return (
      <div
        className="w-full [min-w-400px] h-screen overflow-hidden flex flex-col"
        style={{ backgroundColor: formData.color }}
      >
        <div className="bg-transparent flex-shrink-0">
          <div className="flex items-center justify-between p-4">
            <button onClick={handleCancel} className="p-2">
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              {isSyncing && <RefreshCw size={20} className="text-gray-500 animate-spin" />}
              <button onClick={handleSave} className="p-2" disabled={isSyncing}>
                <Check size={24} className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-2 mb-4">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                className={`w-10 h-10 rounded-full border-2 flex-shrink-0 ${
                  formData.color === color
                    ? 'border-gray-700'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              >
                {formData.color === color && (
                  <div className="flex items-center justify-center">
                    <Check size={20} className="text-gray-700" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 mb-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full text-2xl font-semibold bg-transparent border-none outline-none text-gray-800 placeholder-gray-500"
            />
          </div>

          <textarea
            placeholder="Note content..."
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="w-full p-4 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 resize-none mb-4 text-lg"
            rows="8"
          />

          <div className="mb-4">
            <label className="flex items-center gap-2 bg-transparent rounded-xl p-3 cursor-pointer hover:bg-white hover:bg-opacity-30 transition-all border-2 border-dashed border-gray-400 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-gray-700 font-medium">Add Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {formData.images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="attachment"
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full [min-w-400px] h-screen overflow-hidden flex flex-col bg-gray-50"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1
            className="text-4xl font-bold text-gray-900"
            style={{
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Notu
          </h1>
          <div className="flex items-center gap-2">
            {SYNC_ENABLED && (
              <>
                {isSyncing ? (
                  <RefreshCw size={20} className="text-gray-500 animate-spin" />
                ) : isOnline ? (
                  <button onClick={syncFromServer} className="p-1">
                    <Cloud size={20} className="text-green-500" />
                  </button>
                ) : (
                  <CloudOff size={20} className="text-gray-400" />
                )}
              </>
            )}
          </div>
        </div>

        {syncError && (
          <div className="bg-red-100 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">
            {syncError}
          </div>
        )}

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-none outline-none text-gray-700 shadow-sm text-lg"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 h-fit flex items-center justify-start flex-col">
          {filteredNotes.length === 0 && !searchQuery ? (
            <div className="text-center py-20 text-gray-400 h-full flex items-center flex-col justify-center">
              <p className="text-lg mb-2">No notes yet</p>
              <p className="text-sm">
                Tap the + button to create your first note
              </p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-20 text-gray-400 h-full flex items-center flex-col justify-center">
              <p className="text-lg">No notes found</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleEdit(note)}
                className="rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow relative w-full"
                style={{ backgroundColor: note.color }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1 pr-2">
                    {note.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(note.id);
                    }}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                {note.images && note.images.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {note.images.slice(0, 3).map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          key={image.id}
                          src={image.url}
                          alt="attachment"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                        />
                      </div>
                    ))}
                    {note.images.length > 3 && (
                      <div className="w-full h-16 rounded-lg bg-gray-700 bg-opacity-50 flex items-center justify-center text-white text-sm font-medium">
                        +{note.images.length - 3}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-gray-700 mb-3 line-clamp-2 text-lg">
                  {note.content}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={14} className="mr-1" />
                  {formatDate(note.date)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => setIsAdding(true)}
        className="fixed bottom-6 right-6 bg-gray-800 text-white rounded-full px-6 py-4 shadow-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
      >
        <Plus size={24} />
        <span className="font-medium">New Note</span>
      </button>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
              Delete Note
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this note? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
