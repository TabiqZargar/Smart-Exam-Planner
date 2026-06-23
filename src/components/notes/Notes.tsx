import { useState, useMemo } from "react";
import { format } from "date-fns";
import { generateId } from "../../utils/helpers";
import type { Note } from "../../types";

interface NotesProps {
  notes: Note[];
  onAddNote: (n: Note) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUpdateNote: (id: string, note: Partial<Note>) => void;
}

export default function Notes({ notes, onAddNote, onDeleteNote, onTogglePin, onUpdateNote }: NotesProps) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", subject: "", tags: "", pinned: false });

  const filteredNotes = useMemo(() => {
    const q = search.toLowerCase();
    return notes.filter((n) => {
      if (search && !n.title.toLowerCase().includes(q) && !n.content.toLowerCase().includes(q) && !n.subject.toLowerCase().includes(q) && !n.tags.some((t) => t.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [notes, search]);

  const sortedNotes = useMemo(() =>
    [...filteredNotes].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }),
  [filteredNotes]);

  const resetForm = () => {
    setForm({ title: "", content: "", subject: "", tags: "", pinned: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const noteData = { title: form.title, content: form.content, subject: form.subject, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean), pinned: form.pinned, updatedAt: new Date().toISOString() };
    if (editingId) onUpdateNote(editingId, noteData);
    else onAddNote({ ...noteData, id: generateId(), createdAt: new Date().toISOString() });
    resetForm();
  };

  const handleEdit = (note: Note) => {
    setForm({ title: note.title, content: note.content, subject: note.subject, tags: note.tags.join(", "), pinned: note.pinned });
    setEditingId(note.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notes</h1>
        <p className="page-subtitle">{notes.filter((n) => n.pinned).length} pinned · {notes.length} documents</p>
        <div className="page-actions">
          <div className="search-box" style={{ marginRight: "0.5rem" }}>
            <input className="search-input" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search notes" />
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} aria-label="Add new note">+ New Note</button>
        </div>
      </div>

      {showForm && (
        <div className="glass" style={{ marginBottom: "1rem" }}>
          <div className="glass-header">
            <span className="glass-title">{editingId ? "edit_note" : "new_note"}</span>
            <button className="topbar-btn" onClick={resetForm} aria-label="Close form" style={{ width: 32, height: 32, border: "none" }}>✕</button>
          </div>
          <div className="glass-body">
            <div className="input-group">
              <label className="input-label" htmlFor="note-title">Title</label>
              <input id="note-title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Note title" />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="note-content">Content</label>
              <textarea id="note-content" className="input" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} placeholder="Write your notes here..." />
            </div>
            <div className="flex gap-2">
              <div className="input-group">
                <label className="input-label" htmlFor="note-subject">Subject</label>
                <input id="note-subject" className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="note-tags">Tags (comma separated)</label>
                <input id="note-tags" className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. key, concept, review" />
              </div>
            </div>
            <div className="input-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
                <span>Pin note</span>
              </label>
            </div>
            <button className="btn btn-primary mt-2" onClick={handleSave}>{editingId ? "Update" : "Create"} Note</button>
          </div>
        </div>
      )}

      <div className="note-grid">
        {sortedNotes.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
            <div className="empty-state-icon" aria-hidden="true">📝</div>
            <div className="empty-state-title">No notes found</div>
            <div className="empty-state-desc">{search ? "Try a different search term." : "Create your first note to get started."}</div>
          </div>
        ) : sortedNotes.map((note) => (
          <div key={note.id} className={`note-card ${note.pinned ? "pinned" : ""}`}>
            <div className="note-card-header">
              <button className={`pin-btn ${note.pinned ? "pinned" : ""}`} onClick={() => onTogglePin(note.id)} aria-label={note.pinned ? "Unpin note" : "Pin note"}>
                {note.pinned ? "📌" : "📍"}
              </button>
              <span className="note-card-date" aria-label={`Last updated ${format(new Date(note.updatedAt), "MMM d, yyyy")}`}>{format(new Date(note.updatedAt), "MMM d")}</span>
            </div>
            <h3 className="note-card-title">{note.title}</h3>
            {note.subject && <span className="note-card-subject">{note.subject}</span>}
            <p className="note-card-content">{note.content}</p>
            {note.tags.length > 0 && (
              <div className="note-card-tags">
                {note.tags.map((tag) => (
                  <span key={tag} className="note-tag">{tag}</span>
                ))}
              </div>
            )}
            <div className="note-card-actions">
              <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(note)} aria-label={`Edit ${note.title}`}>✏️</button>
              <button className="btn btn-sm btn-ghost" onClick={() => onDeleteNote(note.id)} aria-label={`Delete ${note.title}`}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
