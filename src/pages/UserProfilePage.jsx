import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaUser, FaEllipsisV, FaUserPlus, FaUserCheck } from "react-icons/fa";
import LikeCount from "../ui/LikeCount";
import DislikeCount from "../ui/DislikeCount";
import CommentCount from "../ui/CommentCount";

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!userId) return;
    // Giriş yapan kullanıcıyı al
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(decoded.userId);
      } catch {}
    }
    // Kullanıcı bilgisi çek
    fetch(`http://localhost:5000/api/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => setUser(null));
    // Takip durumu kontrol et
    fetch(`http://localhost:5000/api/follow/status/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setIsFollowing(!!data.isFollowing))
      .catch(() => setIsFollowing(false));
    // Kullanıcının yüklediği yetenekleri çek
    fetch(`http://localhost:5000/api/user/${userId}/uploads`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUploads(data.uploads || []))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const token = localStorage.getItem("token");
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`http://localhost:5000/api/follow/${userId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'İşlem başarısız');
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      alert(err.message || "Bir hata oluştu");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <div style={{textAlign:'center',marginTop:'2rem'}}>Yükleniyor...</div>;
  if (!user) return <div style={{textAlign:'center',marginTop:'2rem'}}>Kullanıcı bulunamadı.</div>;

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
      <div style={styles.profileCardModern}>
        <div style={{display:'flex',alignItems:'center',gap:16,justifyContent:'center',width:'100%'}}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatarCircle}>
              {user.profilePhotoUrl ? (
                <img src={`http://localhost:5000${user.profilePhotoUrl}`} alt={user.userName} style={styles.avatarImage} />
              ) : (
                <span style={styles.avatarInitial}>{user.fullName ? user.fullName[0].toUpperCase() : (user.userName ? user.userName[0].toUpperCase() : 'K')}</span>
              )}
            </div>
          </div>
          {/* Takip Et/Bırak butonu, kendi profilinde gösterme */}
          {currentUserId && Number(currentUserId) !== Number(userId) && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: followLoading ? 'not-allowed' : 'pointer',
                background: isFollowing ? 'linear-gradient(90deg, #e5e7eb, #d1d5db)' : 'linear-gradient(90deg, #4f46e5, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minWidth: 120,
              }}
            >
              {followLoading ? 'İşleniyor...' : isFollowing ? (<><FaUserCheck style={{color:'#4f46e5'}}/> Takibi Bırak</>) : (<><FaUserPlus style={{color:'#fff'}}/> Takip Et</>)}
            </button>
          )}
        </div>
        <div style={styles.profileUserName}>@{user.userName || user.fullName || 'Kullanıcı'}</div>
        <div style={styles.profileFullName}>{user.fullName}</div>
        <div style={styles.profileBio}>{user.bio}</div>
      </div>
      <div style={styles.uploadsSection}>
        <h3 style={styles.uploadsTitle}>Yüklediği Yetenekler</h3>
        {uploads.length === 0 ? (
          <p>Henüz hiç yetenek yüklememiş.</p>
        ) : (
          <div style={styles.uploadsGrid}>
            {uploads.map((item) => (
              <div key={item.id} style={styles.uploadItem}>
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
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5 60%, #a5b4fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(79,70,229,0.10)',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: '2.7rem',
    fontWeight: 700,
    letterSpacing: '1px',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
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
  profileFullName: {
    fontWeight: 500,
    fontSize: '1.08rem',
    color: '#444',
    marginBottom: '0.2rem',
    textAlign: 'center',
  },
  profileBio: {
    color: '#888',
    fontSize: '0.98rem',
    marginBottom: '0.7rem',
    textAlign: 'center',
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
};

export default UserProfilePage; 