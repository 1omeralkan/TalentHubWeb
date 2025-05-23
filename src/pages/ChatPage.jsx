import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaCircle } from 'react-icons/fa';
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

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
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              ...styles.message,
              ...(message.senderId === parseInt(userId) ? styles.receivedMessage : styles.sentMessage)
            }}
          >
            <div style={styles.messageContent}>
              {message.content}
            </div>
            <div style={styles.messageTime}>
              {formatMessageTime(message.createdAt)}
            </div>
          </div>
        ))}
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