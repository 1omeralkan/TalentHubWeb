import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaUser, FaUpload, FaHome, FaEllipsisV, FaUserPlus, FaUsers } from "react-icons/fa";
import LikeCount from "../ui/LikeCount";
import DislikeCount from "../ui/DislikeCount";
import CommentCount from "../ui/CommentCount";

const ProfilPage = () => {
  const [user, setUser] = useState({});
  const [userId, setUserId] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
      setUser(decoded);
      setUserId(decoded.userId);
    } catch (err) {
      console.error("Token çözümleme hatası:", err);
      navigate("/login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");

    // Kullanıcının yüklediği yetenekleri çek
    fetch("http://localhost:5000/api/my-uploads", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUploads(data.uploads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Takipçileri ve takip edilenleri çek
    fetch(`http://localhost:5000/api/follow/followers/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFollowers(data))
      .catch(err => console.error("Takipçi listesi hatası:", err));

    fetch(`http://localhost:5000/api/follow/following/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFollowing(data))
      .catch(err => console.error("Takip edilenler listesi hatası:", err));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(prev => ({ ...prev, ...data }));
      });
  }, [userId]);

  const handleFollow = async (userId) => {
    if (followLoading[userId]) return;
    
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    const token = localStorage.getItem("token");
    const isFollowing = following.some(f => f.id === userId);
    
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`http://localhost:5000/api/follow/${userId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'İşlem başarısız');
        if (isFollowing) {
          setFollowing(prev => prev.filter(f => f.id !== userId));
        } else {
          // Modalda gösterilen kullanıcıyı bul ve ekle
          const userToAdd = [...followers, ...following].find(u => u.id === userId);
          if (userToAdd) {
            setFollowing(prev => [...prev, userToAdd]);
          } else {
            // fallback: sadece id ile ekle
            setFollowing(prev => [...prev, { id: userId }]);
          }
        }
      } else {
        const text = await res.text();
        throw new Error('Beklenmeyen sunucu cevabı: ' + text.slice(0, 100));
      }
    } catch (err) {
      console.error("Takip işlemi hatası:", err);
      alert(err.message || "Bir hata oluştu");
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const UserList = ({ users, title, onClose }) => (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        <div style={styles.userList}>
          {users.map(user => (
            <div key={user.id} style={styles.userListItem}>
              <div style={styles.userInfo}>
                <div style={styles.userAvatar}>
                  {user.profilePhotoUrl ? (
                    <img src={`http://localhost:5000${user.profilePhotoUrl}`} alt={user.userName} style={styles.avatarImage} />
                  ) : (
                    <span style={styles.avatarInitial}>{user.userName?.[0]?.toUpperCase() || 'K'}</span>
                  )}
                </div>
                <div style={styles.userDetails}>
                  <span style={styles.userName}>@{user.userName}</span>
                  <span style={styles.userFullName}>{user.fullName}</span>
                </div>
              </div>
              {user.id !== user.userId && (
                <button
                  onClick={() => handleFollow(user.id)}
                  disabled={followLoading[user.id]}
                  style={{
                    ...styles.followButton,
                    background: following.some(f => f.id === user.id)
                      ? 'linear-gradient(90deg, #e5e7eb, #d1d5db)'
                      : 'linear-gradient(90deg, #4f46e5, #6366f1)',
                    opacity: followLoading[user.id] ? 0.7 : 1
                  }}
                >
                  <FaUserPlus style={{marginRight: 6, fontSize: '0.9rem'}} />
                  {followLoading[user.id] ? 'İşleniyor...' : 
                    following.some(f => f.id === user.id) ? 'Takip Edildi' : 'Takip Et'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu yeteneği silmek istediğine emin misin?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/uploads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUploads((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Silme işlemi başarısız oldu.");
      }
    } catch (err) {
      alert("Sunucu hatası: Silinemedi.");
    }
  };

  return (
    <div className="profile-content" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
      <div style={styles.profileCardModern}>
        <div style={styles.avatarWrapper}>
          <div style={styles.avatarCircle}>
            {user.profilePhotoUrl ? (
              <img src={`http://localhost:5000${user.profilePhotoUrl}`} alt={user.userName} style={styles.avatarImage} />
            ) : (
              <span style={styles.avatarInitial}>{user.fullName ? user.fullName[0].toUpperCase() : (user.userName ? user.userName[0].toUpperCase() : 'K')}</span>
            )}
          </div>
        </div>
        <div style={styles.profileUserName}>
          @{user.userName || user.fullName || 'Kullanıcı'}
        </div>
        {user.bio && (
          <div style={styles.profileBio}>{user.bio}</div>
        )}
        <div style={styles.profileStatsRow}>
          <div style={styles.profileStat}>
            <span style={styles.profileStatNumber}>{uploads.length}</span>
            <span style={styles.profileStatLabel}>Gönderi</span>
          </div>
          <div 
            style={styles.profileStat} 
            onClick={() => setShowFollowers(true)}
            className="clickable-stat"
          >
            <span style={styles.profileStatNumber}>{followers.length}</span>
            <span style={styles.profileStatLabel}>Takipçi</span>
          </div>
          <div 
            style={styles.profileStat}
            onClick={() => setShowFollowing(true)}
            className="clickable-stat"
          >
            <span style={styles.profileStatNumber}>{following.length}</span>
            <span style={styles.profileStatLabel}>Takip</span>
          </div>
        </div>
        <button style={styles.editProfileButton} onClick={() => navigate('/edit-profile')}>
          Profil Düzenle
        </button>
      </div>

      {/* Takipçiler Modal */}
      {showFollowers && (
        <UserList 
          users={followers} 
          title="Takipçiler" 
          onClose={() => setShowFollowers(false)} 
        />
      )}

      {/* Takip Edilenler Modal */}
      {showFollowing && (
        <UserList 
          users={following} 
          title="Takip Edilenler" 
          onClose={() => setShowFollowing(false)} 
        />
      )}

      {/* Kullanıcının yüklediği yetenekler */}
      <div style={styles.uploadsSection}>
        <h3 style={styles.uploadsTitle}>Yüklediğin Yetenekler</h3>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : uploads.length === 0 ? (
          <p>Henüz hiç yetenek yüklemedin.</p>
        ) : (
          <div style={styles.uploadsGrid}>
            {uploads.map((item) => (
              <div key={item.id} style={styles.uploadItem}>
                <div style={styles.ellipsisWrapper}>
                  <FaEllipsisV style={styles.ellipsisIcon} onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)} />
                  {menuOpenId === item.id && (
                    <div style={styles.menuBox}>
                      <div style={styles.menuItem} onClick={() => { handleDelete(item.id); setMenuOpenId(null); }}>Sil</div>
                    </div>
                  )}
                </div>
                {item.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={`http://localhost:5000${item.mediaUrl}`} controls style={styles.media} />
                ) : (
                  <img src={`http://localhost:5000${item.mediaUrl}`} alt="Yetenek" style={styles.media} />
                )}
                <div style={styles.caption}>{item.caption}</div>
                <div style={styles.date}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 }}>
                  <LikeCount uploadId={item.id} />
                  <DislikeCount uploadId={item.id} />
                  <CommentCount uploadId={item.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  profileCardModern: {
    background: '#fff',
    borderRadius: '18px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    padding: '2.5rem 2.5rem 2rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '400px',
    margin: '2.5rem auto 2rem auto',
  },
  avatarWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.2rem',
  },
  avatarCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5 60%, #a5b4fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(79,70,229,0.10)',
    overflow: 'hidden',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: '2.7rem',
    fontWeight: 700,
    letterSpacing: '1px',
  },
  profileUserName: {
    fontWeight: 600,
    fontSize: '1.35rem',
    color: '#4f46e5',
    marginTop: '0.7rem',
    marginBottom: '0.2rem',
    letterSpacing: '0.2px',
    textAlign: 'center',
  },
  profileBio: {
    color: '#666',
    fontSize: '1.05rem',
    margin: '0.5rem 0 0.7rem 0',
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: '320px',
    whiteSpace: 'pre-line',
    wordBreak: 'break-word',
  },
  profileStatsRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2.5rem',
    margin: '1.1rem 0 1.2rem 0',
  },
  profileStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '1.05rem',
    color: '#444',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
  },
  profileStatNumber: {
    fontWeight: 700,
    fontSize: '1.18rem',
    color: '#4f46e5',
    marginBottom: '2px',
  },
  profileStatLabel: {
    fontWeight: 400,
    fontSize: '0.98rem',
    color: '#888',
  },
  editProfileButton: {
    marginTop: '0.5rem',
    padding: '0.7rem 2.2rem',
    background: 'linear-gradient(90deg, #6366f1 60%, #818cf8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '1.08rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
    transition: 'background 0.2s',
    letterSpacing: '0.2px',
    outline: 'none',
    textAlign: 'center',
    display: 'block',
  },
  uploadsSection: {
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    width: "100%",
    marginTop: "0",
    padding: "2rem",
  },
  uploadsTitle: {
    marginTop: "0",
    marginBottom: "1rem",
    fontSize: "1.2rem",
    fontWeight: "bold",
    textAlign: "center",
  },
  uploadsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  uploadItem: {
    background: "#f3f3f3",
    borderRadius: "8px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    position: 'relative',
  },
  media: {
    width: "100%",
    maxWidth: "160px",
    maxHeight: "120px",
    objectFit: "cover",
    borderRadius: "6px",
    marginBottom: "0.5rem",
  },
  caption: {
    fontSize: "0.95rem",
    marginBottom: "0.3rem",
    textAlign: "center",
  },
  date: {
    fontSize: "0.8rem",
    color: "#888",
    textAlign: "center",
  },
  ellipsisWrapper: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 2,
  },
  ellipsisIcon: {
    fontSize: '1.2rem',
    color: '#888',
    cursor: 'pointer',
    background: '#fff',
    borderRadius: '50%',
    padding: '4px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    transition: 'background 0.2s',
  },
  menuBox: {
    position: 'absolute',
    top: '28px',
    left: 0,
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    minWidth: '70px',
    padding: '4px 0',
    zIndex: 10,
  },
  menuItem: {
    padding: '8px 16px',
    color: '#ef4444',
    fontWeight: 500,
    fontSize: '1rem',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '400px',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
  },
  modalHeader: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#1f2937',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0.5rem',
    lineHeight: 1,
  },
  userList: {
    maxHeight: 'calc(80vh - 60px)',
    overflowY: 'auto',
    padding: '0.5rem 0',
  },
  userListItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.5rem',
    transition: 'background 0.2s',
    cursor: 'pointer',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5 60%, #a5b4fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
    display: 'block',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: '0.95rem',
  },
  userFullName: {
    color: '#6b7280',
    fontSize: '0.85rem',
  },
  followButton: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(79,70,229,0.15)',
    letterSpacing: '0.3px',
    minWidth: '100px',
    justifyContent: 'center',
  },
  clickableStat: {
    '&:hover': {
      background: '#f3f4f6',
      transform: 'translateY(-2px)',
    },
  },
};

export default ProfilPage; 