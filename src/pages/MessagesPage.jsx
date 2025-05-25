import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaCircle, FaEllipsisV, FaTrashAlt } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

const MessagesPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = React.useRef();

  useEffect(() => {
    fetchChats();
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
      const chats = data
        .map(chat => {
          const otherParticipant = chat.participants.find(p => p.user && p.user.id !== currentUserId)?.user;
          const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[0] : null;
          if (!otherParticipant) return null;
          return {
            user: otherParticipant,
            lastMessage: lastMessage,
            chatId: chat.id,
          };
        })
        .filter(Boolean);
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

  const handleDeleteChatForMe = async (chatId) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/messages/chats/${chatId}/forme`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setChats(prev => prev.filter(c => c.chatId !== chatId));
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
          filteredChats
            .filter(chat => chat.user)
            .map((chat) => (
              <div
                key={chat.chatId}
                style={{ ...styles.chatItem, boxShadow: openMenuId === chat.chatId ? '0 4px 24px rgba(99,102,241,0.13)' : styles.chatItem.boxShadow, transition: 'box-shadow 0.18s', position: 'relative' }}
                onMouseLeave={() => setOpenMenuId(null)}
                onClick={e => {
                  if (!e.target.closest('button')) {
                    navigate(`/chat/${chat.user.id}`);
                  }
                }}
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
                    <div style={{ position: 'relative', marginLeft: 8 }}>
                      <button
                        style={getMenuButtonStyle(openMenuId === chat.chatId)}
                        onClick={e => { e.stopPropagation(); setOpenMenuId(chat.chatId); }}
                        aria-label="Sohbet seçenekleri"
                      >
                        <FaEllipsisV />
                      </button>
                      {openMenuId === chat.chatId && (
                        <div ref={menuRef} style={menuStyle}>
                          <button
                            style={menuButtonItemStyle}
                            onClick={e => { e.stopPropagation(); handleDeleteChatForMe(chat.chatId); setOpenMenuId(null); }}
                          >
                            <FaTrashAlt style={{ color: '#FF6B6B', fontSize: 18 }} /> Sohbeti Benden Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={styles.lastMessage}>
                    {chat.lastMessage && chat.lastMessage.content ? chat.lastMessage.content : 'Henüz mesaj yok'}
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
    backgroundColor: '#0A192F',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#E6F1FF',
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
    color: '#64FFDA',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1px solid rgba(100, 255, 218, 0.1)',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#E6F1FF',
    '&:focus': {
      borderColor: '#64FFDA',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    '&::placeholder': {
      color: 'rgba(230, 241, 255, 0.5)',
    },
  },
  chatList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  chatItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
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
    border: '2px solid rgba(100, 255, 218, 0.2)',
  },
  avatarPlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#64FFDA',
    border: '2px solid rgba(100, 255, 218, 0.2)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    color: '#64FFDA',
    fontSize: '0.75rem',
    backgroundColor: '#0A192F',
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
    color: '#E6F1FF',
    fontSize: '1rem',
  },
  lastSeen: {
    fontSize: '0.875rem',
    color: 'rgba(230, 241, 255, 0.6)',
  },
  lastMessage: {
    fontSize: '0.875rem',
    color: 'rgba(230, 241, 255, 0.7)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: 'rgba(230, 241, 255, 0.6)',
    fontSize: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64FFDA',
    fontSize: '1rem',
  },
};

const getMenuButtonStyle = (isOpen) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: isOpen ? '#64FFDA' : 'rgba(230, 241, 255, 0.6)',
  fontSize: 20,
  padding: 4,
  borderRadius: 8,
  transition: 'all 0.2s',
});

const menuStyle = {
  position: 'absolute',
  top: 32,
  right: 0,
  background: '#112240',
  border: '1px solid rgba(100, 255, 218, 0.1)',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  zIndex: 20,
  minWidth: 170,
  padding: '6px 0',
  animation: 'fadeInMenu 0.18s cubic-bezier(.4,1.3,.6,1)',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const menuButtonItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  background: 'none',
  border: 'none',
  color: '#E6F1FF',
  fontWeight: 500,
  fontSize: 16,
  padding: '10px 20px',
  cursor: 'pointer',
  textAlign: 'left',
  borderRadius: 8,
  transition: 'all 0.2s',
};

const styleSheet = document.createElement('style');
styleSheet.innerHTML = `@keyframes fadeInMenu { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} }`;
document.head.appendChild(styleSheet);

export default MessagesPage; 