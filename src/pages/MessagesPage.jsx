import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaCircle } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

const MessagesPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/chat/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Mesajlar getirilemedi');

      const data = await response.json();
      const currentUserId = jwtDecode(token).userId;
      const chats = data.map(chat => {
        const otherParticipant = chat.participants.find(p => p.user.id !== currentUserId)?.user;
        return {
          user: otherParticipant,
          lastMessage: chat.messages[0] || { content: 'Henüz mesaj yok' }
        };
      });
      setChats(chats);
    } catch (error) {
      console.error('Mesajları getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return '';
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Az önce';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} dk önce`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} gün önce`;
    return date.toLocaleDateString();
  };

  const filteredChats = chats.filter(chat => 
    chat.user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 style={styles.title}>Mesajlar</h1>
        <div style={styles.searchContainer}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Mesajlarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.chatList}>
        {filteredChats.length === 0 ? (
          <div style={styles.emptyState}>
            {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz mesajınız yok'}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.user.id}
              style={styles.chatItem}
              onClick={() => navigate(`/chat/${chat.user.id}`)}
            >
              <div style={styles.avatarContainer}>
                {chat.user.profilePhotoUrl ? (
                  <img
                    src={`http://localhost:5000${chat.user.profilePhotoUrl}`}
                    alt={chat.user.userName}
                    style={styles.avatar}
                  />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {chat.user.userName[0].toUpperCase()}
                  </div>
                )}
                {chat.user.isOnline && (
                  <FaCircle style={styles.onlineIndicator} />
                )}
              </div>
              <div style={styles.chatInfo}>
                <div style={styles.chatHeader}>
                  <span style={styles.userName}>@{chat.user.userName}</span>
                  <span style={styles.lastSeen}>
                    {chat.user.isOnline ? 'Çevrimiçi' : formatLastSeen(chat.user.lastSeen)}
                  </span>
                </div>
                <div style={styles.lastMessage}>
                  {chat.lastMessage.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '1rem',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '1rem',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    '&:focus': {
      borderColor: '#4f46e5',
    },
  },
  chatList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  chatItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#f9fafb',
    },
  },
  avatarContainer: {
    position: 'relative',
    marginRight: '1rem',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#6b7280',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    color: '#10b981',
    fontSize: '0.75rem',
    backgroundColor: '#fff',
    borderRadius: '50%',
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  userName: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: '1rem',
  },
  lastSeen: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  lastMessage: {
    fontSize: '0.875rem',
    color: '#6b7280',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6b7280',
    fontSize: '1rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6b7280',
    fontSize: '1rem',
  },
};

export default MessagesPage; 