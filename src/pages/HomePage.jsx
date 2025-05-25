import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCommentDots, FaShare } from "react-icons/fa";
import LikeButton from "../ui/LikeButton";
import CommentSection from "../ui/CommentSection";

const API_BASE = "http://localhost:5000/api";

const HomePage = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [shareCounts, setShareCounts] = useState({});
  const [showShareModalId, setShowShareModalId] = useState(null);
  const [followingList, setFollowingList] = useState([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(null);

  useEffect(() => {
    const fetchUploads = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/uploads/following`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gönderiler yüklenemedi");
        const data = await res.json();
        setUploads(data);
        // Kullanıcıyı JWT'den çek
        if (token) {
          try {
            const { userId, userName, fullName, profilePhotoUrl } = JSON.parse(atob(token.split(".")[1]));
            setCurrentUser({ userId, userName, fullName, profilePhotoUrl });
          } catch {}
        }
      } catch (err) {
        setError("Gönderiler yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchUploads();
  }, []);

  // Her gönderi için paylaşım sayısını çek
  useEffect(() => {
    const fetchAllShareCounts = async () => {
      const counts = {};
      for (const upload of uploads) {
        try {
          const res = await fetch(`${API_BASE}/uploads/${upload.id}/shareCount`);
          const data = await res.json();
          counts[upload.id] = data.count || 0;
        } catch {
          counts[upload.id] = 0;
        }
      }
      setShareCounts(counts);
    };
    if (uploads.length > 0) fetchAllShareCounts();
  }, [uploads]);

  const handleOpenShareModal = async (uploadId) => {
    setShowShareModalId(uploadId);
    setShareSuccess(null);
    setShareLoading(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/follow/following/${currentUser.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFollowingList(data);
    } catch (err) {
      setFollowingList([]);
    }
  };

  const handleShareToUser = async (targetUserId, upload) => {
    setShareLoading(true);
    setShareSuccess(null);
    try {
      const token = localStorage.getItem('token');
      let mediaUrl = upload.mediaUrl;
      if (mediaUrl && !mediaUrl.startsWith('/')) mediaUrl = '/' + mediaUrl;
      let thumbnailUrl = '';
      if (mediaUrl.match(/\.(mp4|webm)$/i)) {
        thumbnailUrl = mediaUrl;
      } else if (mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
        thumbnailUrl = mediaUrl;
      }
      const shareMessage = {
        type: 'share',
        videoId: upload.id,
        thumbnailUrl,
        caption: upload.caption,
        link: `http://localhost:3000/post/${upload.id}`
      };
      const content = JSON.stringify(shareMessage);
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: targetUserId, content })
      });
      if (res.ok) {
        setShareSuccess('Gönderi başarıyla paylaşıldı!');
        // Paylaşım sayısını güncelle
        const countRes = await fetch(`${API_BASE}/uploads/${upload.id}/shareCount`);
        const countData = await countRes.json();
        setShareCounts(prev => ({ ...prev, [upload.id]: countData.count || 0 }));
      } else {
        setShareSuccess('Paylaşım başarısız!');
      }
    } catch (err) {
      setShareSuccess('Paylaşım başarısız!');
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', padding: '32px 0', background: 'linear-gradient(135deg, #0A192F 60%, #112240 100%)' }}>
      <h2 style={{ textAlign: 'center', color: '#64FFDA', fontWeight: 800, fontSize: 30, marginBottom: 32, letterSpacing: 0.2, textShadow: '0 2px 12px #0A192F44' }}>Takip Ettiklerinin Gönderileri</h2>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#64FFDA', fontSize: 20, marginTop: 40 }}>Yükleniyor...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: '#e11d48', fontSize: 18, marginTop: 40 }}>{error}</div>
      ) : uploads.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', fontSize: 18, marginTop: 40 }}>Takip ettiğin kullanıcıların henüz gönderisi yok.</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 36,
          justifyContent: 'center',
          padding: '0 24px',
          maxWidth: 1320,
          margin: '0 auto'
        }}>
          {uploads.map(upload => (
            <div key={upload.id} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #112240 80%, #233554 100%)',
                  borderRadius: 28,
                  boxShadow: '0 8px 36px 0 #64FFDA22, 0 2px 16px 0 #4f46e522',
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'row',
                  minHeight: 420,
                  transition: 'box-shadow 0.22s, transform 0.22s',
                  border: '2.5px solid #233554',
                  position: 'relative',
                  alignItems: 'stretch',
                  marginBottom: 0,
                  cursor: 'pointer',
                  willChange: 'transform',
                  outline: 'none',
                  filter: 'drop-shadow(0 2px 8px #64FFDA22)',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.boxShadow = '0 12px 40px 0 #64FFDA44, 0 2px 16px 0 #4f46e544';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.012)';
                  e.currentTarget.style.border = '2.5px solid #64FFDA';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.boxShadow = '0 8px 36px 0 #64FFDA22, 0 2px 16px 0 #4f46e522';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.border = '2.5px solid #233554';
                }}
              >
                {/* Kartın ana içeriği */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Profil satırı */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px 0 22px', background: 'rgba(17,34,64,0.93)', borderTopLeftRadius: 28, borderTopRightRadius: 28, minHeight: 48 }}>
                    <Link to={`/profile/${upload.user.id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#64FFDA', gap: 10 }}>
                      {upload.user.profilePhotoUrl ? (
                        <img src={`http://localhost:5000${upload.user.profilePhotoUrl}`} alt={upload.user.userName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #64FFDA44', background: '#112240', boxShadow: '0 1px 3px #64FFDA22' }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#233554', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64FFDA', fontSize: 17, border: '2px solid #64FFDA44', boxShadow: '0 1px 3px #64FFDA22' }}>{upload.user.userName?.[0]?.toUpperCase() || 'K'}</div>
                      )}
                      <span style={{ fontWeight: 700, fontSize: 17, color: '#64FFDA', marginLeft: 8 }}>@{upload.user.userName || upload.user.fullName || 'Kullanıcı'}</span>
                    </Link>
                    <span style={{ color: '#b0b3c6', fontSize: 13, fontWeight: 500, marginLeft: 'auto', letterSpacing: 0.1 }}>{new Date(upload.createdAt).toLocaleString('tr-TR')}</span>
                  </div>
                  {/* Medya alanı */}
                  <div style={{ width: '100%', background: '#181F2F', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0', borderRadius: 0, borderBottom: '1px solid #233554', borderTop: 'none', overflow: 'hidden' }}>
                    {upload.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={`http://localhost:5000${upload.mediaUrl}`} controls style={{ width: '100%', maxHeight: 320, borderRadius: 0, background: '#181F2F', transition: 'box-shadow 0.2s' }} />
                    ) : (
                      <img src={`http://localhost:5000${upload.mediaUrl}`} alt="Yetenek" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 0, background: '#181F2F', transition: 'box-shadow 0.2s' }} />
                    )}
                  </div>
                  {/* Açıklama alanı */}
                  <div style={{ padding: '16px 22px 18px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', background: 'transparent' }}>
                    <div style={{ fontSize: 17, color: '#64FFDA', fontWeight: 500, whiteSpace: 'pre-line', lineHeight: 1.6, marginBottom: 2 }}>{upload.caption}</div>
                  </div>
                </div>
                {/* Dikey aksiyon barı */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    background: '#192B3F',
                    borderRadius: '18px',
                    padding: '1.2rem 0.7rem',
                    boxShadow: '0 2px 12px #64FFDA22',
                    minWidth: '64px',
                    zIndex: 2,
                    height: 'fit-content',
                    margin: '24px 18px 24px 0',
                    alignSelf: 'center',
                    position: 'relative',
                    border: '2px solid #233554',
                    transition: 'box-shadow 0.18s, background 0.18s',
                  }}
                >
                  <LikeButton uploadId={upload.id} style={{ color: '#64FFDA', fontSize: '2rem', filter: 'drop-shadow(0 2px 8px #64FFDA44)' }} />
                  <div
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', color: openCommentsId === upload.id ? '#4f46e5' : '#bbb', fontWeight: 600, fontSize: '1.08rem', userSelect: 'none', transition: 'color 0.2s' }}
                    onClick={() => setOpenCommentsId(openCommentsId === upload.id ? null : upload.id)}
                    title="Yorumları gör"
                  >
                    <FaCommentDots style={{ fontSize: '2rem', color: openCommentsId === upload.id ? '#4f46e5' : '#bbb', filter: openCommentsId === upload.id ? 'drop-shadow(0 2px 8px #6366f1aa)' : 'none', transition: 'color 0.2s, filter 0.2s' }} />
                    <span style={{ fontSize: '1.08rem', color: openCommentsId === upload.id ? '#4f46e5' : '#bbb', fontWeight: 700 }}>{upload.commentCount}</span>
                  </div>
                  <div
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#a21caf', fontWeight: 700, fontSize: '1.08rem', userSelect: 'none', transition: 'color 0.2s' }}
                    onClick={() => handleOpenShareModal(upload.id)}
                    title="Paylaş"
                  >
                    <FaShare style={{ fontSize: '2rem', color: '#a21caf', filter: 'drop-shadow(0 2px 8px #a21caf88)', transition: 'color 0.2s, filter 0.2s' }} />
                    <span style={{ fontSize: '1.08rem', color: '#a21caf', fontWeight: 700 }}>{shareCounts[upload.id] || 0}</span>
                  </div>
                </div>
              </div>
              {/* Yorumlar paneli ayrı bir kart olarak, gönderi kartının hemen altında ve aynı sütunda */}
              {openCommentsId === upload.id && (
                <div style={{
                  background: '#112240',
                  borderRadius: 18,
                  boxShadow: '0 4px 24px #64FFDA22',
                  width: '100%',
                  margin: '18px 0 36px 0',
                  overflow: 'auto',
                  border: '2px solid #233554',
                  animation: 'slideDownPanel 0.25s',
                  maxWidth: '100%',
                  display: 'block',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 10px 18px', borderBottom: '1.5px solid #233554', background: 'rgba(10,25,47,0.93)', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
                    <span style={{ fontWeight: 800, fontSize: 20, color: '#64FFDA', letterSpacing: 0.1 }}>Yorumlar</span>
                    <button onClick={() => setOpenCommentsId(null)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#64FFDA', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'color 0.18s' }} aria-label="Kapat">×</button>
                  </div>
                  <div style={{ padding: '10px 18px 18px 18px', background: '#192B3F', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
                    <CommentSection uploadId={upload.id} currentUser={currentUser} hideTitle inputStyle={{ background: '#233554', color: '#E6F1FF', border: '1.5px solid #64FFDA44', borderRadius: 10 }} textStyle={{ color: '#E6F1FF' }} />
                  </div>
                </div>
              )}
              {showShareModalId === upload.id && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,30,30,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 28, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 32px #6366f155', position: 'relative' }}>
                    <button onClick={() => setShowShareModalId(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#bbb', cursor: 'pointer', borderRadius: 6 }}>×</button>
                    <h3 style={{ fontWeight: 700, fontSize: 20, color: '#4f46e5', marginBottom: 18 }}>Gönderiyi Paylaş</h3>
                    {followingList.length === 0 ? (
                      <div style={{ color: '#888', fontSize: 16, textAlign: 'center', margin: '24px 0' }}>Takip ettiğin kimse yok.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {followingList.map(f => (
                          <button key={f.id} onClick={() => handleShareToUser(f.id, upload)} disabled={shareLoading} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f3f4f6', cursor: 'pointer', fontWeight: 600, fontSize: 16, color: '#23223b', transition: 'background 0.18s', opacity: shareLoading ? 0.7 : 1 }}>
                            {f.profilePhotoUrl ? <img src={`http://localhost:5000${f.profilePhotoUrl}`} alt={f.userName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} /> : <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6366f1', fontSize: 17 }}>{f.userName?.[0]?.toUpperCase() || 'K'}</span>}
                            <span>@{f.userName}</span>
                            <span style={{ color: '#6b7280', fontWeight: 400, fontSize: 15 }}>{f.fullName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {shareSuccess && <div style={{ marginTop: 18, color: shareSuccess.includes('başarı') ? '#22c55e' : '#e11d48', fontWeight: 600, textAlign: 'center' }}>{shareSuccess}</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes slideDownPanel {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage; 