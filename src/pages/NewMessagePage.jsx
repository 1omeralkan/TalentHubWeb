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
    background: 'linear-gradient(135deg, #112240 80%, #233554 100%)',
    borderRadius: '20px',
    boxShadow: '0 4px 32px #64FFDA22, 0 0 0 2px #64FFDA22',
    border: '2px solid #233554',
    color: '#E6F1FF',
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
    color: '#64FFDA',
    cursor: 'pointer',
    padding: '0.5rem',
    marginRight: '1rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s, color 0.2s',
    boxShadow: '0 2px 8px #64FFDA22',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#64FFDA',
    margin: 0,
    letterSpacing: 0.2,
    textShadow: '0 2px 8px #0A192F44',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '1.5rem',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64FFDA',
    fontSize: '1.1rem',
  },
  searchInput: {
    width: '100%',
    maxWidth: '100%',
    padding: '0.85rem 1.2rem 0.85rem 2.5rem',
    border: '2px solid #64FFDA44',
    borderRadius: '12px',
    fontSize: '1.08rem',
    outline: 'none',
    background: '#192B3F',
    color: '#E6F1FF',
    boxShadow: '0 1px 4px #64FFDA11',
    transition: 'border 0.18s, box-shadow 0.18s',
    boxSizing: 'border-box',
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.7rem',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #192B3F 80%, #233554 100%)',
    boxShadow: '0 2px 12px #64FFDA11',
    border: '1.5px solid #233554',
    transition: 'background 0.18s, box-shadow 0.18s',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '1rem',
    border: '2px solid #64FFDA',
    boxShadow: '0 1px 4px #64FFDA33',
    background: '#E6F1FF',
  },
  avatarPlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5 60%, #64FFDA 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#fff',
    marginRight: '1rem',
    border: '2px solid #64FFDA',
    boxShadow: '0 1px 4px #64FFDA33',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 700,
    color: '#64FFDA',
    fontSize: '1.08rem',
    marginBottom: '0.18rem',
    letterSpacing: 0.1,
    textShadow: '0 2px 8px #0A192F44',
  },
  fullName: {
    fontSize: '0.98rem',
    color: '#E6F1FF',
    opacity: 0.85,
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#b0b3c6',
    fontSize: '1.08rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64FFDA',
    fontSize: '1.08rem',
    fontWeight: 600,
  },
};

export default NewMessagePage; 