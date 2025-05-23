import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowLeft } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

const NewMessagePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.length > 0) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/search/users?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Kullanıcılar getirilemedi');

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const handleCreateChat = async (otherUserId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch('http://localhost:5000/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId })
      });
      if (!response.ok) throw new Error('Sohbet oluşturulamadı');
      navigate('/messages');
    } catch (error) {
      alert('Sohbet oluşturulamadı!');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FaArrowLeft />
        </button>
        <h1 style={styles.title}>Yeni Mesaj</h1>
      </div>

      <div style={styles.searchContainer}>
        <FaSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Kullanıcı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.userList}>
        {loading ? (
          <div style={styles.loading}>Aranıyor...</div>
        ) : users.length === 0 ? (
          <div style={styles.emptyState}>
            {searchTerm ? 'Kullanıcı bulunamadı' : 'Kullanıcı aramak için yazın'}
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              style={styles.userItem}
            >
              {user.profilePhotoUrl ? (
                <img
                  src={`http://localhost:5000${user.profilePhotoUrl}`}
                  alt={user.userName}
                  style={styles.avatar}
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {user.userName[0].toUpperCase()}
                </div>
              )}
              <div style={styles.userInfo}>
                <div style={styles.userName}>@{user.userName}</div>
                <div style={styles.fullName}>{user.fullName}</div>
              </div>
              <button
                style={{
                  marginLeft: 'auto',
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1.2rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
                onClick={() => handleCreateChat(user.id)}
              >
                Sohbet Oluştur
              </button>
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
    display: 'flex',
    alignItems: 'center',
    marginBottom: '2rem',
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
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#1f2937',
    margin: 0,
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
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  userItem: {
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
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '1rem',
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
    marginRight: '1rem',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: '1rem',
    marginBottom: '0.25rem',
  },
  fullName: {
    fontSize: '0.875rem',
    color: '#6b7280',
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

export default NewMessagePage; 