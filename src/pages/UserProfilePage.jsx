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
    background: 'linear-gradient(135deg, #112240 80%, #233554 100%)',
    borderRadius: '22px',
    boxShadow: '0 8px 36px #64FFDA22, 0 0 0 2px #64FFDA33',
    padding: '2.7rem 2.5rem 2.2rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '420px',
    margin: '2.5rem auto 2rem auto',
    position: 'relative',
    zIndex: 1,
  },
  avatarWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.2rem',
  },
  avatarCircle: {
    width: '104px',
    height: '104px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #64FFDA 60%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 16px #64FFDA33',
    border: '3px solid #E6F1FF',
  },
  avatarInitial: {
    color: '#0A192F',
    fontSize: '2.9rem',
    fontWeight: 800,
    letterSpacing: '1.5px',
    textShadow: '0 2px 8px #64FFDA44',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
    border: '2.5px solid #64FFDA',
    boxShadow: '0 2px 12px #64FFDA33',
    background: '#112240',
  },
  profileUserName: {
    fontWeight: 800,
    fontSize: '1.38rem',
    color: '#64FFDA',
    marginTop: '0.7rem',
    marginBottom: '0.2rem',
    letterSpacing: '0.25px',
    textAlign: 'center',
    textShadow: '0 2px 8px #0A192F44',
  },
  profileFullName: {
    fontWeight: 600,
    fontSize: '1.13rem',
    color: '#E6F1FF',
    marginBottom: '0.2rem',
    textAlign: 'center',
    textShadow: '0 2px 8px #0A192F44',
  },
  profileBio: {
    color: '#7dd3fc',
    fontSize: '1.01rem',
    marginBottom: '0.7rem',
    textAlign: 'center',
    fontWeight: 500,
    textShadow: '0 2px 8px #0A192F44',
  },
  uploadsSection: {
    background: 'linear-gradient(135deg, #112240 80%, #233554 100%)',
    borderRadius: '18px',
    boxShadow: '0 8px 36px #4f46e522',
    maxWidth: '900px',
    width: '100%',
    marginTop: '0',
    padding: '2.2rem 2.2rem 2rem 2.2rem',
    position: 'relative',
    zIndex: 1,
  },
  uploadsTitle: {
    marginTop: '0',
    marginBottom: '1.1rem',
    fontSize: '1.22rem',
    fontWeight: 800,
    textAlign: 'center',
    color: '#64FFDA',
    letterSpacing: '0.2px',
    textShadow: '0 2px 8px #0A192F44',
  },
  uploadsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '1.25rem',
    marginTop: '1.1rem',
  },
  uploadItem: {
    background: 'linear-gradient(135deg, #192B3F 80%, #233554 100%)',
    borderRadius: '14px',
    padding: '1.15rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 2px 12px #64FFDA11',
    position: 'relative',
    border: '2px solid #4f46e544',
    transition: 'box-shadow 0.18s, border 0.18s',
  },
  media: {
    width: '100%',
    maxWidth: '180px',
    maxHeight: '130px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '0.7rem',
    boxShadow: '0 1.5px 8px #64FFDA22',
    border: '2px solid #64FFDA44',
  },
  caption: {
    fontSize: '1.01rem',
    marginBottom: '0.3rem',
    textAlign: 'center',
    color: '#E6F1FF',
    fontWeight: 600,
    textShadow: '0 2px 8px #0A192F44',
  },
  date: {
    fontSize: '0.89rem',
    color: '#64FFDA',
    textAlign: 'center',
    fontWeight: 500,
    marginBottom: '0.2rem',
  },
};

export default UserProfilePage; 