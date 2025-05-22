import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCommentDots } from "react-icons/fa";
import LikeButton from "../ui/LikeButton";
import CommentSection from "../ui/CommentSection";

const API_BASE = "http://localhost:5000/api";

const HomePage = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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

  return (
    <div style={{ width: '100%', minHeight: '100vh', padding: '32px 0', background: '#f8fafc' }}>
      <h2 style={{ textAlign: 'center', color: '#23223b', fontWeight: 700, fontSize: 28, marginBottom: 28, letterSpacing: 0.2 }}>Takip Ettiklerinin Gönderileri</h2>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#6366f1', fontSize: 20, marginTop: 40 }}>Yükleniyor...</div>
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
                  background: 'linear-gradient(135deg, #f8fafc 80%, #e0e7ff 100%)',
                  borderRadius: 24,
                  boxShadow: '0 6px 32px 0 rgba(99,102,241,0.10)',
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'row',
                  minHeight: 420,
                  transition: 'box-shadow 0.22s, transform 0.22s',
                  border: '1.5px solid #e0e7ff',
                  position: 'relative',
                  alignItems: 'stretch',
                  marginBottom: 0,
                  cursor: 'pointer',
                  willChange: 'transform',
                  outline: 'none',
                  filter: 'drop-shadow(0 2px 8px #6366f11a)',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.boxShadow = '0 10px 36px 0 rgba(99,102,241,0.16)';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.012)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.boxShadow = '0 6px 32px 0 rgba(99,102,241,0.10)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Kartın ana içeriği */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Profil satırı */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px 0 22px', background: 'rgba(245,245,255,0.7)', borderTopLeftRadius: 24, borderTopRightRadius: 24, minHeight: 48 }}>
                    <Link to={`/profile/${upload.user.id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#23223b', gap: 10 }}>
                      {upload.user.profilePhotoUrl ? (
                        <img src={`http://localhost:5000${upload.user.profilePhotoUrl}`} alt={upload.user.userName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #e0e7ff', background: '#f3e8ff', boxShadow: '0 1px 3px #e0e7ff33' }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6366f1', fontSize: 17, border: '1.5px solid #e0e7ff', boxShadow: '0 1px 3px #e0e7ff33' }}>{upload.user.userName?.[0]?.toUpperCase() || 'K'}</div>
                      )}
                      <span style={{ fontWeight: 600, fontSize: 17, color: '#4f46e5', marginLeft: 8 }}>@{upload.user.userName || upload.user.fullName || 'Kullanıcı'}</span>
                    </Link>
                    <span style={{ color: '#b0b3c6', fontSize: 13, fontWeight: 500, marginLeft: 'auto', letterSpacing: 0.1 }}>{new Date(upload.createdAt).toLocaleString('tr-TR')}</span>
                  </div>
                  {/* Medya alanı */}
                  <div style={{ width: '100%', background: '#f3f4f6', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0', borderRadius: 0, borderBottom: '1px solid #e0e7ff', borderTop: 'none', overflow: 'hidden' }}>
                    {upload.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={`http://localhost:5000${upload.mediaUrl}`} controls style={{ width: '100%', maxHeight: 320, borderRadius: 0, background: '#18181b', transition: 'box-shadow 0.2s' }} />
                    ) : (
                      <img src={`http://localhost:5000${upload.mediaUrl}`} alt="Yetenek" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 0, background: '#f3f4f6', transition: 'box-shadow 0.2s' }} />
                    )}
                  </div>
                  {/* Açıklama alanı */}
                  <div style={{ padding: '16px 22px 18px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', background: 'transparent' }}>
                    <div style={{ fontSize: 17, color: '#23223b', fontWeight: 500, whiteSpace: 'pre-line', lineHeight: 1.6, marginBottom: 2 }}>{upload.caption}</div>
                  </div>
                </div>
                {/* Dikey aksiyon barı */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.5rem',
                  background: 'rgba(255,255,255,0.96)',
                  borderRadius: '18px',
                  padding: '1.2rem 0.7rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  minWidth: '64px',
                  zIndex: 2,
                  height: 'fit-content',
                  margin: '24px 18px 24px 0',
                  alignSelf: 'center',
                  position: 'relative',
                  border: '1px solid #e0e7ff',
                  transition: 'box-shadow 0.18s, background 0.18s',
                }}>
                  <LikeButton uploadId={upload.id} />
                  <div
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#6366f1', fontWeight: 500, fontSize: '1.08rem', userSelect: 'none', transition: 'color 0.2s' }}
                    onClick={() => setOpenCommentsId(openCommentsId === upload.id ? null : upload.id)}
                    title="Yorumları gör"
                  >
                    <FaCommentDots style={{ fontSize: '2rem', color: openCommentsId === upload.id ? '#4f46e5' : '#bbb', filter: openCommentsId === upload.id ? 'drop-shadow(0 2px 8px #6366f1aa)' : 'none', transition: 'color 0.2s, filter 0.2s' }} />
                    <span style={{ fontSize: '1.08rem', color: openCommentsId === upload.id ? '#4f46e5' : '#bbb', fontWeight: 600 }}>{upload.commentCount}</span>
                  </div>
                </div>
              </div>
              {/* Yorumlar paneli ayrı bir kart olarak, gönderi kartının hemen altında ve aynı sütunda */}
              {openCommentsId === upload.id && (
                <div style={{
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 4px 24px rgba(30,32,44,0.13)',
                  width: '100%',
                  margin: '18px 0 36px 0',
                  overflow: 'auto',
                  border: '1.5px solid #e0e7ff',
                  animation: 'slideDownPanel 0.25s',
                  maxWidth: '100%',
                  display: 'block',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 10px 18px', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 700, fontSize: 20, color: '#4f46e5' }}>Yorumlar</span>
                    <button onClick={() => setOpenCommentsId(null)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#bbb', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'color 0.18s' }} aria-label="Kapat">×</button>
                  </div>
                  <div style={{ padding: '10px 18px 18px 18px' }}>
                    <CommentSection uploadId={upload.id} currentUser={currentUser} hideTitle />
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