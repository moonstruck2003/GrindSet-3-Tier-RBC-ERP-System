import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Users,
  Shield,
  Crown,
  Wifi,
  WifiOff,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  User,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { api, API_BASE_URL } from '../config/api';

export default function ProjectChatModal({ isOpen, onClose, projectId, projectName, isDark = true }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [projectMeta, setProjectMeta] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [showRoster, setShowRoster] = useState(false);

  const messagesEndRef = useRef(null);
  const hubConnectionRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('grindset_user') || '{}');

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Load chat history and project metadata
  const loadChatData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.projectChatMessages(projectId);
      setProjectMeta(res);
      setMessages(res.messages || []);
      setTimeout(() => scrollToBottom(false), 100);
    } catch (err) {
      console.error('Failed to load project chat history:', err);
      setError(err.message || 'Failed to load project discussions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !projectId) return;

    loadChatData();

    // Initialize SignalR connection
    const token = localStorage.getItem('grindset_token');
    const hubUrl = `${API_BASE_URL}/hubs/project-chat`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    hubConnectionRef.current = connection;

    connection.on('ReceiveChatMessage', (msg) => {
      if (msg.projectId === parseInt(projectId)) {
        setMessages((prev) => {
          // Prevent duplicates if already added locally
          if (prev.some((m) => m.messageId === msg.messageId)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => scrollToBottom(true), 100);
      }
    });

    connection.onreconnecting(() => {
      setConnectionStatus('connecting');
    });

    connection.onreconnected(() => {
      setConnectionStatus('connected');
      connection.invoke('JoinProjectChat', parseInt(projectId)).catch(console.error);
    });

    connection.onclose(() => {
      setConnectionStatus('disconnected');
    });

    // Start connection
    connection
      .start()
      .then(() => {
        setConnectionStatus('connected');
        return connection.invoke('JoinProjectChat', parseInt(projectId));
      })
      .catch((err) => {
        console.warn('SignalR WebSocket connection notice:', err);
        setConnectionStatus('disconnected');
      });

    return () => {
      if (hubConnectionRef.current) {
        hubConnectionRef.current
          .invoke('LeaveProjectChat', parseInt(projectId))
          .catch(() => {})
          .finally(() => {
            hubConnectionRef.current?.stop();
          });
      }
    };
  }, [isOpen, projectId]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || sending || !projectId) return;

    setSending(true);
    try {
      const res = await api.sendProjectChatMessage(projectId, { messageText: text });
      setInputText('');
      // If SignalR doesn't echo immediately, add to local state
      if (res && res.messageId) {
        setMessages((prev) => {
          if (prev.some((m) => m.messageId === res.messageId)) return prev;
          return [...prev, res];
        });
        setTimeout(() => scrollToBottom(true), 80);
      }
    } catch (err) {
      console.error('Failed to dispatch message:', err);
      alert(err.message || 'Could not send message. Verify you are an assigned team member.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  // Theme tokens
  const bgMain = isDark ? '#0B0F19' : '#FFFFFF';
  const bgCard = isDark ? '#111827' : '#F9FAFB';
  const bgHeader = isDark ? '#0F172A' : '#F1F5F9';
  const border = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textMuted = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#1F2937' : '#FFFFFF';

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          style={{
            width: '100%',
            maxWidth: '820px',
            height: '85vh',
            maxHeight: '750px',
            background: bgMain,
            borderRadius: '16px',
            border: `1px solid ${border}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: bgHeader,
              borderBottom: `1px solid ${border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              >
                <MessageSquare className="w-5 h-5" />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: textPrimary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {projectMeta?.projectName || projectName || `Project #${projectId}`}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818CF8',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    Live Chat
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: '0.78rem',
                    color: textMuted,
                    marginTop: 2,
                  }}
                >
                  {projectMeta?.projectManagerName && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Crown className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                      <strong style={{ color: textPrimary }}>PM:</strong> {projectMeta.projectManagerName}
                    </span>
                  )}
                  {/* Connection indicator */}
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.72rem',
                    }}
                  >
                    {connectionStatus === 'connected' ? (
                      <>
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: '#10B981',
                            boxShadow: '0 0 8px #10B981',
                          }}
                        />
                        <span style={{ color: '#10B981' }}>SignalR Real-time</span>
                      </>
                    ) : connectionStatus === 'connecting' ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" style={{ color: '#F59E0B' }} />
                        <span style={{ color: '#F59E0B' }}>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3" style={{ color: '#EF4444' }} />
                        <span style={{ color: '#EF4444' }}>REST Sync</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {projectMeta?.members && (
                <button
                  onClick={() => setShowRoster(!showRoster)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: showRoster ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    border: `1px solid ${showRoster ? '#6366F1' : border}`,
                    color: showRoster ? '#818CF8' : textMuted,
                    transition: 'all 0.15s ease',
                  }}
                  title="View Assigned Project Team"
                >
                  <Users className="w-4 h-4" />
                  <span>Team ({projectMeta.members.length})</span>
                </button>
              )}

              <button
                onClick={onClose}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: 'transparent',
                  border: `1px solid ${border}`,
                  color: textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Roster Drawer (Collapsible) */}
          <AnimatePresence>
            {showRoster && projectMeta?.members && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{
                  background: bgCard,
                  borderBottom: `1px solid ${border}`,
                  overflow: 'hidden',
                  padding: '12px 20px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                  Assigned Project Team Members ({projectMeta.members.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: '100px', overflowY: 'auto' }}>
                  {projectMeta.members.map((m) => {
                    const isPM = m.isProjectManager;
                    return (
                      <div
                        key={m.employeeId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: '0.75rem',
                          background: isPM ? 'rgba(245, 158, 11, 0.12)' : isDark ? '#1F2937' : '#E5E7EB',
                          border: isPM ? '1px solid rgba(245, 158, 11, 0.4)' : `1px solid ${border}`,
                          color: isPM ? '#F59E0B' : textPrimary,
                        }}
                      >
                        {isPM ? <Crown className="w-3 h-3 text-amber-500" /> : <User className="w-3 h-3 text-gray-400" />}
                        <span style={{ fontWeight: 600 }}>{m.fullName}</span>
                        <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>({m.roleInProject || m.designation})</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Messages Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              background: isDark ? 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.04), transparent 70%)' : '#FFFFFF',
            }}
          >
            {loading ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: textMuted }}>
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#6366F1' }} />
                <p style={{ fontSize: '0.9rem' }}>Loading secure project stream...</p>
              </div>
            ) : error ? (
              <div
                style={{
                  margin: 'auto',
                  maxWidth: 420,
                  textAlign: 'center',
                  padding: 24,
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#EF4444',
                }}
              >
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</p>
                <p style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 4 }}>
                  Only the Project Manager and assigned engineers on this project roster are granted channel access.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: textMuted }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: '#818CF8',
                  }}
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 style={{ margin: 0, color: textPrimary, fontSize: '1rem', fontWeight: 600 }}>No messages yet</h4>
                <p style={{ margin: '6px 0 0', fontSize: '0.8rem', maxWidth: 320 }}>
                  Be the first to initiate collaboration between the Project Manager and assigned project engineers!
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.senderUserId === currentUser.userId;
                const isPM = msg.senderRole === 'Project Manager';
                const formattedTime = msg.sentAt
                  ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <motion.div
                    key={msg.messageId || index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '100%',
                    }}
                  >
                    {/* Sender badge header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 4,
                        fontSize: '0.72rem',
                        color: textMuted,
                        padding: '0 4px',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: isMe ? '#818CF8' : textPrimary }}>
                        {isMe ? 'You' : msg.senderName}
                      </span>
                      {isPM ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: '1px 6px',
                            borderRadius: 10,
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#F59E0B',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                          }}
                        >
                          <Crown className="w-2.5 h-2.5" /> PM
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: '1px 6px',
                            borderRadius: 10,
                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                          }}
                        >
                          {msg.senderRole}
                        </span>
                      )}
                      <span style={{ opacity: 0.6 }}>• {formattedTime}</span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '10px 15px',
                        borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: isMe
                          ? 'linear-gradient(135deg, #4F46E5, #6366F1)'
                          : isPM
                          ? isDark
                            ? 'linear-gradient(135deg, #1E1B4B, #1F2937)'
                            : '#F8FAFC'
                          : bgCard,
                        color: isMe ? '#FFFFFF' : textPrimary,
                        border: isMe
                          ? '1px solid rgba(255, 255, 255, 0.15)'
                          : isPM
                          ? '1px solid rgba(245, 158, 11, 0.35)'
                          : `1px solid ${border}`,
                        boxShadow: isMe
                          ? '0 4px 12px rgba(79, 70, 229, 0.25)'
                          : '0 2px 6px rgba(0, 0, 0, 0.08)',
                        fontSize: '0.88rem',
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.messageText}
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Footer */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '14px 20px',
              background: bgHeader,
              borderTop: `1px solid ${border}`,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder={
                  error
                    ? 'Channel locked: Not authorized on this project'
                    : 'Type a realtime message to project team (Enter to send)...'
                }
                value={inputText}
                disabled={Boolean(error) || loading}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: 10,
                  background: inputBg,
                  color: textPrimary,
                  border: `1px solid ${border}`,
                  fontSize: '0.88rem',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || sending || Boolean(error)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '11px 18px',
                borderRadius: 10,
                background: inputText.trim() && !sending ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : isDark ? '#374151' : '#E5E7EB',
                color: inputText.trim() && !sending ? '#FFFFFF' : textMuted,
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: inputText.trim() && !sending ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                boxShadow: inputText.trim() && !sending ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none',
              }}
            >
              {sending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
