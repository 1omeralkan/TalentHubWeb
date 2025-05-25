import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaCircle, FaEllipsisV, FaTrashAlt, FaTrashRestore } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';

const ChatPage = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef();

  useEffect(() => {
    // WebSocket bağlantısını kur
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      newSocket.emit('user_connected', decoded.userId);
    }

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        if (message.senderId === parseInt(userId) || message.receiverId === parseInt(userId)) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      });
    }
  }, [socket, userId]);

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.userId);
      } catch {}
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/messages/with/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Mesajlar getirilemedi');

      const data = await response.json();
      setMessages(data);
      
      // İlk mesajın gönderen/alıcı bilgisinden diğer kullanıcının bilgilerini al
      if (data.length > 0) {
        const firstMessage = data[0];
        const otherUserData = firstMessage.senderId === parseInt(userId) 
          ? firstMessage.sender 
          : firstMessage.receiver;
        setOtherUser(otherUserData);
      } else {
        // Eğer mesaj yoksa, kullanıcı bilgilerini ayrıca getir
        fetchUserInfo();
      }
    } catch (error) {
      console.error('Mesajları getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Kullanıcı bilgileri getirilemedi');

      const userData = await response.json();
      setOtherUser(userData);
    } catch (error) {
      console.error('Kullanıcı bilgilerini getirme hatası:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: parseInt(userId),
          content: newMessage.trim()
        })
      });

      if (!response.ok) throw new Error('Mesaj gönderilemedi');

      const message = await response.json();
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteForMe = async (messageId) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/messages/messages/${messageId}/forme`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const handleDeleteForAll = async (messageId) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/messages/messages/${messageId}/forall`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

  const styleSheet = document.createElement('style');
  styleSheet.innerHTML = `@keyframes fadeInMenu { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} }`;
  document.head.appendChild(styleSheet);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FaArrowLeft />
        </button>
        <div style={styles.userInfo}>
          {otherUser?.profilePhotoUrl ? (
            <img
              src={`http://localhost:5000${otherUser.profilePhotoUrl}`}
              alt={otherUser.userName}
              style={styles.avatar}
            />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {otherUser?.userName?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={styles.userName}>@{otherUser?.userName}</div>
            {otherUser?.isOnline ? (
              <div style={styles.onlineStatus}>
                <FaCircle style={styles.onlineIndicator} />
                Çevrimiçi
              </div>
            ) : (
              <div style={styles.lastSeen}>
                Son görülme: {new Date(otherUser?.lastSeen).toLocaleString('tr-TR')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((message) => {
          let shareData = null;
          try {
            const parsed = JSON.parse(message.content);
            if (parsed && parsed.type === 'share') shareData = parsed;
          } catch {}
          const isOwnMessage = currentUserId === message.senderId;
          return (
            <div
              key={message.id}
              style={{
                ...styles.message,
                ...(message.senderId === parseInt(userId) ? styles.receivedMessage : styles.sentMessage),
                boxShadow: openMenuId === message.id ? '0 4px 24px rgba(99,102,241,0.13)' : styles.message.boxShadow,
                transition: 'box-shadow 0.18s',
                position: 'relative',
              }}
              onMouseLeave={() => setOpenMenuId(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={styles.messageContent}>
                  {shareData ? (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 180, maxWidth: 260, background: '#f8fafc', borderRadius: 16, boxShadow: '0 2px 12px rgba(99,102,241,0.08)', padding: '14px 12px 10px 12px', margin: '0 auto',
                    }}>
                      {shareData.thumbnailUrl && (shareData.thumbnailUrl.endsWith('.mp4') || shareData.thumbnailUrl.endsWith('.webm')) ? (
                        <video src={`http://localhost:5000${shareData.thumbnailUrl}`} style={{ width: '100%', maxWidth: 180, borderRadius: 12, background: '#eee', marginBottom: 8, boxShadow: '0 1px 6px #6366f122' }} controls />
                      ) : shareData.thumbnailUrl ? (
                        <img src={`http://localhost:5000${shareData.thumbnailUrl}`} alt="thumbnail" style={{ width: '100%', maxWidth: 180, borderRadius: 12, objectFit: 'cover', background: '#eee', marginBottom: 8, boxShadow: '0 1px 6px #6366f122' }} />
                      ) : null}
                      <div style={{ fontWeight: 500, color: '#23223b', fontSize: 14, marginBottom: 2, textAlign: 'center', width: '100%', wordBreak: 'break-word', letterSpacing: 0.1 }}>{shareData.caption}</div>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                <div style={{ position: 'relative', marginLeft: 8 }}>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: openMenuId === message.id ? '#4f46e5' : '#888',
                      fontSize: 20,
                      padding: 4,
                      borderRadius: 8,
                      transition: 'color 0.18s, background 0.18s',
                      boxShadow: openMenuId === message.id ? '0 2px 8px #6366f133' : 'none',
                    }}
                    onClick={() => setOpenMenuId(message.id)}
                    aria-label="Mesaj seçenekleri"
                  >
                    <FaEllipsisV />
                  </button>
                  {openMenuId === message.id && (
                    <div
                      ref={menuRef}
                      style={{
                        position: 'absolute',
                        top: 32,
                        right: 0,
                        background: '#fff',
                        border: '1.5px solid #e0e7ff',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(79,70,229,0.13)',
                        zIndex: 20,
                        minWidth: 170,
                        padding: '6px 0',
                        animation: 'fadeInMenu 0.18s cubic-bezier(.4,1.3,.6,1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <button
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', color: '#23223b', fontWeight: 500, fontSize: 16, padding: '10px 20px', cursor: 'pointer', textAlign: 'left', borderRadius: 8, transition: 'background 0.15s',
                          marginBottom: 2,
                        }}
                        onClick={() => { handleDeleteForMe(message.id); setOpenMenuId(null); }}
                        onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseOut={e => e.currentTarget.style.background = 'none'}
                      >
                        <FaTrashAlt style={{ color: '#e11d48', fontSize: 18 }} /> Benden Sil
                      </button>
                      {isOwnMessage && (
                        <button
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', color: '#e11d48', fontWeight: 600, fontSize: 16, padding: '10px 20px', cursor: 'pointer', textAlign: 'left', borderRadius: 8, transition: 'background 0.15s',
                          }}
                          onClick={() => { handleDeleteForAll(message.id); setOpenMenuId(null); }}
                          onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                          onMouseOut={e => e.currentTarget.style.background = 'none'}
                        >
                          <FaTrashRestore style={{ color: '#e11d48', fontSize: 18 }} /> Herkesten Sil
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.messageTime}>
                {formatMessageTime(message.createdAt)}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Mesajınızı yazın..."
          style={styles.input}
        />
        <button type="submit" style={styles.sendButton}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    height: 'calc(100vh - 4rem)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  backButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    color: '#4f46e5',
    cursor: 'pointer',
    padding: '0.5rem',
    marginRight: '1rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#f3f4f6',
    },
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#6b7280',
  },
  userName: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: '1rem',
  },
  onlineStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#10b981',
  },
  onlineIndicator: {
    fontSize: '0.5rem',
  },
  lastSeen: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  message: {
    maxWidth: '70%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    position: 'relative',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4f46e5',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    borderBottomLeftRadius: '4px',
  },
  messageContent: {
    fontSize: '1rem',
    wordBreak: 'break-word',
  },
  messageTime: {
    fontSize: '0.75rem',
    opacity: 0.7,
    marginTop: '0.25rem',
    textAlign: 'right',
  },
  inputContainer: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  input: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    '&:focus': {
      borderColor: '#4f46e5',
    },
  },
  sendButton: {
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#4338ca',
    },
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6b7280',
    fontSize: '1rem',
  },
};

export default ChatPage; 