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
    background: 'linear-gradient(135deg, #112240 80%, #233554 100%)',
    borderRadius: '22px',
    boxShadow: '0 6px 32px #64FFDA33, 0 0 0 2px #64FFDA22',
    padding: '2.5rem 2.5rem 2rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '400px',
    margin: '2.5rem auto 2rem auto',
    border: '2px solid #233554',
    color: '#E6F1FF',
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
    background: 'linear-gradient(135deg, #4f46e5 60%, #64FFDA 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 12px #64FFDA33',
    overflow: 'hidden',
    border: '2.5px solid #64FFDA',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: '2.7rem',
    fontWeight: 700,
    letterSpacing: '1px',
    textShadow: '0 2px 8px #0A192F44',
  },
  profileUserName: {
    fontWeight: 800,
    fontSize: '1.35rem',
    color: '#64FFDA',
    marginTop: '0.7rem',
    marginBottom: '0.2rem',
    letterSpacing: '0.2px',
    textAlign: 'center',
    textShadow: '0 2px 8px #0A192F44',
  },
  profileBio: {
    color: '#E6F1FF',
    fontSize: '1.05rem',
    margin: '0.5rem 0 0.7rem 0',
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: '320px',
    whiteSpace: 'pre-line',
    wordBreak: 'break-word',
    opacity: 0.85,
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
    color: '#64FFDA',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.18s',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #192B3F 80%, #233554 100%)',
    boxShadow: '0 1px 6px #64FFDA11',
    border: '1.5px solid #233554',
  },
  profileStatNumber: {
    fontWeight: 800,
    fontSize: '1.18rem',
    color: '#64FFDA',
    marginBottom: '2px',
    textShadow: '0 2px 8px #0A192F44',
  },
  profileStatLabel: {
    fontWeight: 400,
    fontSize: '0.98rem',
    color: '#E6F1FF',
    opacity: 0.8,
  },
  editProfileButton: {
    marginTop: '0.5rem',
    padding: '0.7rem 2.2rem',
    background: 'linear-gradient(90deg, #64FFDA 0%, #4f46e5 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 800,
    fontSize: '1.08rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px #64FFDA22',
    transition: 'background 0.2s',
    letterSpacing: '0.2px',
    textShadow: '0 2px 8px #0A192F44',
  },
  uploadsSection: {
    background: 'linear-gradient(135deg, #112240 80%, #233554 100%)',
    borderRadius: '18px',
    boxShadow: '0 4px 24px #64FFDA22',
    maxWidth: '700px',
    width: '100%',
    marginTop: '0',
    padding: '2rem',
    border: '2px solid #233554',
    color: '#E6F1FF',
  },
  uploadsTitle: {
    marginTop: '0',
    marginBottom: '1rem',
    fontSize: '1.25rem',
    fontWeight: 800,
    textAlign: 'center',
    color: '#64FFDA',
    letterSpacing: 0.2,
    textShadow: '0 2px 8px #0A192F44',
  },
  uploadsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.2rem',
    marginTop: '1rem',
  },
  uploadItem: {
    background: 'linear-gradient(135deg, #192B3F 80%, #233554 100%)',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 2px 8px #64FFDA11',
    position: 'relative',
    border: '1.5px solid #233554',
    color: '#E6F1FF',
  },
  media: {
    width: '100%',
    maxWidth: '180px',
    maxHeight: '130px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    boxShadow: '0 1px 6px #64FFDA22',
    background: '#0A192F',
  },
  caption: {
    fontSize: '1.05rem',
    marginBottom: '0.3rem',
    textAlign: 'center',
    color: '#64FFDA',
    fontWeight: 700,
    textShadow: '0 2px 8px #0A192F44',
  },
  date: {
    fontSize: '0.9rem',
    color: '#b0b3c6',
    textAlign: 'center',
    marginBottom: '0.2rem',
  },
  ellipsisWrapper: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 2,
  },
  ellipsisIcon: {
    fontSize: '1.2rem',
    color: '#64FFDA',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #112240 80%, #233554 100%)',
    borderRadius: '50%',
    padding: '4px',
    boxShadow: '0 1px 4px #64FFDA22',
    transition: 'background 0.2s',
  },
  menuBox: {
    position: 'absolute',
    top: '28px',
    left: 0,
    background: 'linear-gradient(135deg, #112240 80%, #233554 100%)',
    borderRadius: '10px',
    boxShadow: '0 2px 8px #64FFDA22',
    minWidth: '90px',
    padding: '4px 0',
    zIndex: 10,
    border: '1.5px solid #64FFDA44',
  },
  menuItem: {
    padding: '10px 18px',
    color: '#ef4444',
    fontWeight: 700,
    fontSize: '1.05rem',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    borderRadius: '8px',
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
    background: 'linear-gradient(135deg, #112240 80%, #233554 100%)',
    borderRadius: '18px',
    width: '90%',
    maxWidth: '400px',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 4px 24px #64FFDA22',
    border: '2px solid #233554',
    color: '#E6F1FF',
  },
  modalHeader: {
    padding: '1rem 1.5rem',
    borderBottom: '1.5px solid #64FFDA44',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#64FFDA',
    fontWeight: 800,
    fontSize: '1.15rem',
    textShadow: '0 2px 8px #0A192F44',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#64FFDA',
    letterSpacing: 0.1,
    textShadow: '0 2px 8px #0A192F44',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#64FFDA',
    cursor: 'pointer',
    padding: '0.5rem',
    lineHeight: 1,
    borderRadius: '8px',
    boxShadow: '0 1px 4px #64FFDA22',
    transition: 'background 0.15s',
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
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #192B3F 80%, #233554 100%)',
    boxShadow: '0 1px 6px #64FFDA11',
    border: '1.5px solid #233554',
    color: '#E6F1FF',
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
    background: 'linear-gradient(135deg, #4f46e5 60%, #64FFDA 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    border: '2px solid #64FFDA',
    boxShadow: '0 1px 4px #64FFDA33',
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
    fontWeight: 700,
    color: '#64FFDA',
    fontSize: '1.05rem',
    textShadow: '0 2px 8px #0A192F44',
  },
  userFullName: {
    color: '#E6F1FF',
    fontSize: '0.95rem',
    opacity: 0.85,
  },
  followButton: {
    padding: '6px 12px',
    borderRadius: '10px',
    border: 'none',
    color: '#fff',
    fontSize: '0.98rem',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px #64FFDA22',
    letterSpacing: '0.3px',
    minWidth: '100px',
    justifyContent: 'center',
    background: 'linear-gradient(90deg, #64FFDA 0%, #4f46e5 100%)',
    border: '1.5px solid #64FFDA',
    textShadow: '0 2px 8px #0A192F44',
  },
  clickableStat: {
    '&:hover': {
      background: '#f3f4f6',
      transform: 'translateY(-2px)',
    },
  },
};

export default ProfilPage; 