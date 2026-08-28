import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, FolderKanban, User, Tag, Trash2, Edit2, Shield, Plus, CheckSquare } from 'lucide-react';
import { api } from '../config/api';

export default function ItemDetailDrawer({ item, itemType = 'task', isOpen, onClose, onItemUpdated, lightMode }) {
  const [status, setStatus] = useState('To Do');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([
    { id: 1, text: 'Verify unit tests pass', done: true },
    { id: 2, text: 'Update OpenAPI schema', done: false },
  ]);
  const [newSubtask, setNewSubtask] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setStatus(item.Status || item.status || 'To Do');
      setPriority(item.Priority || item.priority || 'Medium');
      setDescription(item.Description || item.description || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSaveStatus = async (newStatus) => {
    setStatus(newStatus);
    if (itemType === 'task' && item.TaskId) {
      try {
        await api.updateTask(item.TaskId, { status: newStatus });
        if (onItemUpdated) onItemUpdated();
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    }
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    setSubtasks(prev => [...prev, { id: Date.now(), text: newSubtask.trim(), done: false }]);
    setNewSubtask('');
  };

  const toggleSubtask = (id) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const cardBg = lightMode ? '#FFFFFF' : '#0B1B3D';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const sectionBg = lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.03)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          width: '100%', maxWidth: 460, height: '100vh', background: cardBg,
          borderLeft: `1px solid ${border}`, boxShadow: '-10px 0 30px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto'
        }}
      >
        {/* Top Drawer Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', padding: '3px 8px', borderRadius: 6, background: 'rgba(0,82,204,0.15)', color: '#4C9AFF' }}>
              {itemType === 'task' ? `TASK-#${item.TaskId || item.id || 101}` : `PROJ-#${item.projectId || 1}`}
            </span>
            <span style={{ fontSize: 11, color: textMut }}>{item.ProjectName || item.project || 'Core Project'}</span>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Title */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: textPri, margin: '0 0 6px' }}>{item.Title || item.title || item.projectName}</h2>
            <div style={{ fontSize: 12, color: textMut }}>Created {new Date().toLocaleDateString()} &nbsp;·&nbsp; Enterprise Workflow</div>
          </div>

          {/* Quick Property Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 14, background: sectionBg, borderRadius: 14, border: `1px solid ${border}` }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: textMut, marginBottom: 4 }}>Status</div>
              <select
                className="gs-input"
                style={{ fontSize: 12, padding: '5px 8px' }}
                value={status}
                onChange={e => handleSaveStatus(e.target.value)}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: textMut, marginBottom: 4 }}>Priority</div>
              <select
                className="gs-input"
                style={{ fontSize: 12, padding: '5px 8px' }}
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: sectionBg, borderRadius: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #0052CC, #6554C0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12 }}>
              {(item.AssigneeName || 'A')[0]}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: textPri }}>{item.AssigneeName || 'Alex Vance'}</div>
              <div style={{ fontSize: 10, color: textMut }}>Assigned Engineer</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="gs-label" style={{ color: textMut }}>Description</label>
            <textarea
              rows={4}
              className="gs-input"
              style={{ resize: 'none', fontSize: 13 }}
              placeholder="Add description and technical specs..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Subtask Checklist */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: textMut, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckSquare style={{ width: 14, height: 14 }} /> Subtask Checklist ({subtasks.filter(s => s.done).length}/{subtasks.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              {subtasks.map(s => (
                <div
                  key={s.id}
                  onClick={() => toggleSubtask(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
                    background: sectionBg, border: `1px solid ${border}`, cursor: 'pointer'
                  }}
                >
                  <input type="checkbox" checked={s.done} readOnly style={{ accentColor: '#0052CC' }} />
                  <span style={{ fontSize: 12, textDecoration: s.done ? 'line-through' : 'none', color: s.done ? textMut : textPri }}>
                    {s.text}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Add subtask item..."
                className="gs-input"
                style={{ fontSize: 12, padding: '6px 10px' }}
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                Add
              </button>
            </form>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
