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
    maxWidth: '900px',
    margin: '0 auto',
    height: 'calc(100vh - 2.5rem)',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #0A192F 70%, #112240 100%)',
    borderRadius: '22px',
    boxShadow: '0 8px 36px #64FFDA22, 0 0 0 2px #64FFDA33',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.1rem 1.5rem 1.1rem 1.1rem',
    borderBottom: '1.5px solid #233554',
    background: 'linear-gradient(90deg, #112240 80%, #233554 100%)',
    boxShadow: '0 2px 12px #0A192F22',
    zIndex: 2,
  },
  backButton: {
    background: 'linear-gradient(135deg,#4f46e5 60%,#64FFDA 100%)',
    border: 'none',
    fontSize: '1.3rem',
    color: '#fff',
    cursor: 'pointer',
    padding: '0.6rem',
    marginRight: '1.1rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px #4f46e522',
    transition: 'background 0.18s, box-shadow 0.18s',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.1rem',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2.5px solid #64FFDA',
    boxShadow: '0 2px 12px #64FFDA33',
    background: '#112240',
  },
  avatarPlaceholder: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#233554 60%,#4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#64FFDA',
    border: '2.5px solid #64FFDA',
    boxShadow: '0 2px 12px #64FFDA33',
  },
  userName: {
    fontWeight: 800,
    color: '#E6F1FF',
    fontSize: '1.08rem',
    letterSpacing: 0.1,
    textShadow: '0 2px 8px #0A192F44',
  },
  onlineStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.97rem',
    color: '#64FFDA',
    fontWeight: 700,
  },
  onlineIndicator: {
    fontSize: '0.7rem',
    color: '#64FFDA',
  },
  lastSeen: {
    fontSize: '0.97rem',
    color: '#7dd3fc',
    fontWeight: 600,
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '2.1rem 1.5rem 1.1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem',
    background: 'none',
  },
  message: {
    maxWidth: '70%',
    padding: '1.05rem 1.25rem',
    borderRadius: '18px',
    position: 'relative',
    boxShadow: '0 2px 12px #64FFDA11',
    fontWeight: 600,
    fontSize: '1.07rem',
    transition: 'box-shadow 0.18s',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(90deg,#64FFDA 60%,#4f46e5 100%)',
    color: '#0A192F',
    borderBottomRightRadius: '6px',
    boxShadow: '0 2px 16px #64FFDA33',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    background: 'linear-gradient(135deg,#112240 80%,#233554 100%)',
    color: '#E6F1FF',
    borderBottomLeftRadius: '6px',
    boxShadow: '0 2px 16px #4f46e522',
  },
  messageContent: {
    fontSize: '1.07rem',
    wordBreak: 'break-word',
    letterSpacing: 0.1,
  },
  messageTime: {
    fontSize: '0.93rem',
    opacity: 0.7,
    marginTop: '0.35rem',
    textAlign: 'right',
    color: '#64FFDA',
    fontWeight: 700,
    textShadow: '0 2px 8px #0A192F44',
  },
  inputContainer: {
    display: 'flex',
    gap: '1.1rem',
    padding: '1.1rem 1.5rem',
    borderTop: '1.5px solid #233554',
    background: 'linear-gradient(90deg,#112240 80%,#233554 100%)',
    zIndex: 2,
  },
  input: {
    flex: 1,
    padding: '1.05rem 1.2rem',
    border: '2px solid #64FFDA44',
    borderRadius: '14px',
    fontSize: '1.09rem',
    outline: 'none',
    background: '#192B3F',
    color: '#E6F1FF',
    fontWeight: 600,
    boxShadow: '0 1.5px 5px #64FFDA11',
    transition: 'border 0.18s, box-shadow 0.18s',
  },
  sendButton: {
    background: 'linear-gradient(90deg,#64FFDA,#4f46e5)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '1.05rem 1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1.13rem',
    boxShadow: '0 2px 12px #64FFDA22',
    transition: 'background 0.2s, box-shadow 0.2s',
    textShadow: '0 2px 8px #0A192F44',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64FFDA',
    fontSize: '1.15rem',
    fontWeight: 700,
  },
};

export default ChatPage; 