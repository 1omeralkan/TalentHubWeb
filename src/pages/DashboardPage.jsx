import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaUser, FaUpload, FaHome, FaPlusSquare, FaSearch, FaHeart, FaCommentDots, FaBookmark, FaShare, FaUserPlus, FaTimes } from "react-icons/fa";
import LikeButton from "../ui/LikeButton";
import CommentSection from "../ui/CommentSection";

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState({});
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const navigate = useNavigate();
  const location = useLocation();
  const [exploreItems, setExploreItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Token çözümleme hatası:", err);
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Yetkisiz");
        return res.json();
      })
      .then((data) => setMessage(data.message))
      .catch(() => {
        setMessage("Yetkisiz erişim");
        navigate("/login");
      });

    fetch("http://localhost:5000/api/explore", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setExploreItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    // Yorum sayısını çek
    const fetchCommentCount = async () => {
      if (!exploreItems[activeIndex]?.id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/comments/${exploreItems[activeIndex].id}`);
        const data = await res.json();
        // Tüm yorumlar ve alt yanıtları recursive say
        function countAllComments(comments) {
          if (!Array.isArray(comments)) return 0;
          let total = 0;
          for (const comment of comments) {
            total += 1;
            if (comment.replies && comment.replies.length > 0) {
              total += countAllComments(comment.replies);
            }
          }
          return total;
        }
        setCommentCount(countAllComments(data));
      } catch {
        setCommentCount(0);
      }
    };
    fetchCommentCount();
  }, [activeIndex, exploreItems]);

  const videoItems = exploreItems.filter(item =>
    item.mediaUrl.endsWith('.mp4') || item.mediaUrl.endsWith('.webm')
  );

  useEffect(() => {
    videoRefs.current.forEach((ref, idx) => {
      if (ref) {
        if (idx === activeIndex) {
          ref.play();
        } else {
          ref.pause();
          ref.currentTime = 0;
        }
      }
    });
  }, [activeIndex, videoItems]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        setActiveIndex((prev) => Math.min(prev + 1, videoItems.length - 1));
      } else if (e.key === "ArrowUp") {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [videoItems.length]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleUploadRedirect = () => {
    navigate("/upload");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const checkFollowStatus = async (userId) => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/follow/status/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.isFollowing) {
        setFollowedUsers(prev => new Set([...prev, userId]));
      }
    } catch (err) {
      console.error("Takip durumu kontrol hatası:", err);
    }
  };

  useEffect(() => {
    if (videoItems[activeIndex]?.user?.id) {
      checkFollowStatus(videoItems[activeIndex].user.id);
    }
  }, [activeIndex, videoItems]);

  const handleFollow = async (userId) => {
    if (!userId || followLoading) return;
    
    setFollowLoading(true);
    const token = localStorage.getItem("token");
    const isFollowing = followedUsers.has(userId);
    
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

      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        if (isFollowing) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });
    } catch (err) {
      console.error("Takip işlemi hatası:", err);
      alert(err.message || "Bir hata oluştu");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleOpenShareModal = async () => {
    setShowShareModal(true);
    setShareSuccess(null);
    setShareLoading(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/follow/following/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFollowingList(data);
    } catch (err) {
      setFollowingList([]);
    }
  };

  const handleShareToUser = async (targetUserId) => {
    setShareLoading(true);
    setShareSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const currentVideo = videoItems[activeIndex];
      const content = `@${user.userName} bir gönderi paylaştı: http://localhost:3000/post/${currentVideo.id}`;
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
    <div style={{
      ...styles.tiktokMainArea,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : videoItems.length === 0 ? (
        <p>Hiç video yok.</p>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1320px',
          margin: '0 auto',
          transition: 'all 0.35s cubic-bezier(.4,1.3,.6,1)',
        }}>
          <div style={{
            transition: 'transform 0.35s cubic-bezier(.4,1.3,.6,1)',
            transform: showCommentsPanel ? 'translateX(-20px)' : 'translateX(0)',
            marginRight: showCommentsPanel ? '0' : '0',
          }}>
            <div style={styles.tiktokVideoOuter}>
              <div style={styles.videoActionWrapper}>
                <div style={styles.tiktokVideoCardPro}>
                  <video
                    ref={el => videoRefs.current[activeIndex] = el}
                    src={`http://localhost:5000${videoItems[activeIndex].mediaUrl}`}
                    style={styles.tiktokVideoPro}
                    controls
                    autoPlay
                    loop
                  />
                </div>
                <div style={styles.tiktokActionBar}>
                  <LikeButton uploadId={videoItems[activeIndex].id} />
                  <div
                    style={styles.actionItem}
                    onClick={() => setShowCommentsPanel(true)}
                    onMouseEnter={e => {
                      e.currentTarget.querySelector('svg').style.color = '#4f46e5';
                      e.currentTarget.querySelector('svg').style.filter = 'drop-shadow(0 2px 8px #6366f1aa)';
                      e.currentTarget.querySelector('span').style.color = '#4f46e5';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.querySelector('svg').style.color = '#bbb';
                      e.currentTarget.querySelector('svg').style.filter = 'none';
                      e.currentTarget.querySelector('span').style.color = '#bbb';
                    }}
                  >
                    <FaCommentDots style={{ ...styles.actionIcon }} />
                    <span style={{ ...styles.actionCount }}>{commentCount}</span>
                  </div>
                  <div
                    style={styles.actionItem}
                    onMouseEnter={e => {
                      e.currentTarget.querySelector('svg').style.color = '#a21caf';
                      e.currentTarget.querySelector('svg').style.filter = 'drop-shadow(0 2px 8px #a21caf88)';
                      e.currentTarget.querySelector('span').style.color = '#a21caf';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.querySelector('svg').style.color = '#bbb';
                      e.currentTarget.querySelector('svg').style.filter = 'none';
                      e.currentTarget.querySelector('span').style.color = '#bbb';
                    }}
                  >
                    <FaShare style={{ ...styles.actionIcon }} onClick={handleOpenShareModal} />
                    <span style={{ ...styles.actionCount }}>7</span>
                  </div>
                </div>
              </div>
              <div style={styles.tiktokInfoBoxPro}>
                <div style={styles.userInfoContainer}>
                  {videoItems[activeIndex].user?.profilePhotoUrl ? (
                    <Link to={`/profile/${videoItems[activeIndex].user.id}`} style={{ display: 'inline-block' }}>
                      <img
                        src={`http://localhost:5000${videoItems[activeIndex].user.profilePhotoUrl}`}
                        alt={videoItems[activeIndex].user.userName}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1.5px solid #e0e7ff',
                          background: '#f3e8ff',
                          marginRight: 4,
                          boxShadow: '0 1px 4px #e0e7ff55',
                          transition: 'box-shadow 0.18s',
                          cursor: 'pointer',
                        }}
                      />
                    </Link>
                  ) : (
                    <Link to={`/profile/${videoItems[activeIndex].user.id}`} style={{ display: 'inline-block' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: '#f3e8ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#a21caf',
                          fontSize: 18,
                          marginRight: 4,
                          border: '1.5px solid #e0e7ff',
                          boxShadow: '0 1px 4px #e0e7ff55',
                          transition: 'box-shadow 0.18s',
                          cursor: 'pointer',
                        }}
                      >
                        {videoItems[activeIndex].user?.userName?.[0]?.toUpperCase() || 'K'}
                      </div>
                    </Link>
                  )}
                  <span style={styles.infoUserPro}>@{videoItems[activeIndex].user?.userName || videoItems[activeIndex].user?.fullName || 'Kullanıcı'}</span>
                  <button 
                    onClick={() => handleFollow(videoItems[activeIndex].user?.id)}
                    disabled={followLoading}
                    style={{
                      ...styles.followButton,
                      background: followedUsers.has(videoItems[activeIndex].user?.id) 
                        ? 'linear-gradient(90deg, #e5e7eb, #d1d5db)'
                        : 'linear-gradient(90deg, #4f46e5, #6366f1)',
                      opacity: followLoading ? 0.7 : 1,
                      cursor: followLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FaUserPlus style={{marginRight: 6, fontSize: '0.9rem'}} />
                    {followLoading ? 'İşleniyor...' : 
                      followedUsers.has(videoItems[activeIndex].user?.id) ? 'Takip Edildi' : 'Takip Et'}
                  </button>
                </div>
                <span style={styles.infoCaptionPro}>{videoItems[activeIndex].caption}</span>
                {/* Analiz Sonucu */}
                {videoItems[activeIndex].analysis ? (
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: 10,
                    padding: '12px 18px',
                    marginTop: 14,
                    fontSize: '1rem',
                    color: '#23223b',
                    boxShadow: '0 1.5px 6px rgba(99,102,241,0.06)',
                    minWidth: 220,
                    maxWidth: 320,
                    textAlign: 'left',
                    border: '1.2px solid #e0e7ff',
                    fontWeight: 500
                  }}>
                    <div style={{fontWeight:600, color:'#4f46e5', marginBottom:4, fontSize:'1.07rem'}}>Video Analizi</div>
                    <div>Toplam Frame: <b>{videoItems[activeIndex].analysis.frame_count}</b></div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>Ortalama Renk: <span style={{display:'inline-block',width:18,height:18,background:`rgb(${videoItems[activeIndex].analysis.avg_color.map(Math.round).join(',')})`,borderRadius:4,border:'1px solid #ddd',verticalAlign:'middle'}}></span></div>
                    <div>Poz Tespiti: <b style={{color:videoItems[activeIndex].analysis.pose_detected?'#22c55e':'#ef4444'}}>{videoItems[activeIndex].analysis.pose_detected ? 'Var' : 'Yok'}</b></div>
                  </div>
                ) : (
                  <div style={{color:'#888',fontStyle:'italic',marginTop:12,fontSize:'0.98rem'}}>Analiz ediliyor...</div>
                )}
              </div>
            </div>
          </div>
          {showCommentsPanel && (
            <div style={{ ...styles.commentsPanelFixed, position: 'static', boxShadow: '0 0 24px rgba(30,32,44,0.13)' }}>
              <div style={styles.commentsPanelHeader}>
                <span style={{fontWeight:700, fontSize:20}}>Yorumlar</span>
                <button onClick={() => setShowCommentsPanel(false)} style={styles.closeButton} aria-label="Kapat"><FaTimes /></button>
              </div>
              <div style={styles.commentsPanelContent}>
                <CommentSection uploadId={videoItems[activeIndex].id} currentUser={user} hideTitle />
              </div>
            </div>
          )}
          {showShareModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,30,30,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 28, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 32px #6366f155', position: 'relative' }}>
                <button onClick={() => setShowShareModal(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#bbb', cursor: 'pointer', borderRadius: 6 }}>×</button>
                <h3 style={{ fontWeight: 700, fontSize: 20, color: '#4f46e5', marginBottom: 18 }}>Gönderiyi Paylaş</h3>
                {followingList.length === 0 ? (
                  <div style={{ color: '#888', fontSize: 16, textAlign: 'center', margin: '24px 0' }}>Takip ettiğin kimse yok.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {followingList.map(f => (
                      <button key={f.id} onClick={() => handleShareToUser(f.id)} disabled={shareLoading} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f3f4f6', cursor: 'pointer', fontWeight: 600, fontSize: 16, color: '#23223b', transition: 'background 0.18s', opacity: shareLoading ? 0.7 : 1 }}>
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
      )}
    </div>
  );
};

export default DashboardPage;

const styles = {
  tiktokMainArea: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9f9f9',
  },
  tiktokVideoOuter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    maxWidth: '900px',
    minHeight: '80vh',
  },
  videoActionWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '340px',
    marginBottom: '0.5rem',
  },
  tiktokVideoCard: {
    position: 'relative',
    background: '#000',
    borderRadius: '22px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '420px',
    height: '700px',
    overflow: 'hidden',
  },
  tiktokVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '22px',
    background: '#000',
  },
  tiktokInfoBoxNew: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    background: 'rgba(30,30,30,0.60)',
    color: '#fff',
    borderBottomLeftRadius: '22px',
    borderBottomRightRadius: '22px',
    padding: '18px 22px 14px 22px',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    fontSize: '1.08rem',
    fontWeight: 400,
    boxShadow: 'none',
  },
  infoUserNew: {
    fontWeight: 600,
    fontSize: '1.08rem',
    color: '#b3aaff',
    marginBottom: '2px',
    letterSpacing: '0.2px',
  },
  infoCaptionNew: {
    fontWeight: 400,
    fontSize: '1.05rem',
    color: '#fff',
    opacity: 0.95,
    whiteSpace: 'pre-line',
    wordBreak: 'break-word',
  },
  tiktokActionBar: {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%) translateX(32px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    background: 'rgba(255,255,255,0.85)',
    borderRadius: '18px',
    padding: '1.2rem 0.7rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    minWidth: '60px',
    zIndex: 2,
    height: 'fit-content',
  },
  actionItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.3rem',
    cursor: 'pointer',
    color: '#444',
    fontWeight: 500,
    fontSize: '1.08rem',
    transition: 'color 0.2s',
    userSelect: 'none',
  },
  actionIcon: {
    fontSize: '2rem',
    marginBottom: '0.1rem',
    color: '#bbb',
    transition: 'color 0.18s, filter 0.18s',
    filter: 'none',
  },
  actionIconActive: {
    color: '#4f46e5',
    filter: 'drop-shadow(0 2px 8px #6366f1aa)',
  },
  actionIconShare: {
    color: '#a21caf',
    filter: 'drop-shadow(0 2px 8px #a21caf88)',
  },
  actionCount: {
    fontSize: '1rem',
    color: '#bbb',
    fontWeight: 500,
    transition: 'color 0.18s',
  },
  tiktokVideoCardSmall: {
    position: 'relative',
    background: '#000',
    borderRadius: '18px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '380px',
    height: '600px',
    overflow: 'hidden',
  },
  tiktokVideoSmall: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '18px',
    background: '#000',
  },
  tiktokInfoBoxBelow: {
    marginTop: '16px',
    width: '360px',
    background: 'rgba(255,255,255,0.97)',
    color: '#222',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    padding: '12px 18px 10px 18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    fontSize: '1.05rem',
    fontWeight: 400,
  },
  infoUserBelow: {
    fontWeight: 600,
    fontSize: '1.08rem',
    color: '#4f46e5',
    marginBottom: '2px',
    letterSpacing: '0.2px',
  },
  infoCaptionBelow: {
    fontWeight: 400,
    fontSize: '1.03rem',
    color: '#222',
    opacity: 0.97,
    whiteSpace: 'pre-line',
    wordBreak: 'break-word',
  },
  tiktokVideoCardPro: {
    position: 'relative',
    background: '#000',
    borderRadius: '22px',
    boxShadow: '0 6px 32px rgba(0,0,0,0.16)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '340px',
    height: '540px',
    overflow: 'hidden',
    marginBottom: '18px',
  },
  tiktokVideoPro: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '22px',
    background: '#000',
  },
  tiktokInfoBoxPro: {
    width: '320px',
    background: 'rgba(255,255,255,0.98)',
    color: '#222',
    borderRadius: '14px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
    padding: '14px 20px 12px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    fontSize: '1.07rem',
    fontWeight: 400,
    marginBottom: '8px',
  },
  infoUserPro: {
    fontWeight: 600,
    fontSize: '1.09rem',
    color: '#4f46e5',
    marginBottom: '2px',
    letterSpacing: '0.2px',
  },
  infoCaptionPro: {
    fontWeight: 400,
    fontSize: '1.04rem',
    color: '#222',
    opacity: 0.97,
    whiteSpace: 'pre-line',
    wordBreak: 'break-word',
  },
  userInfoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '4px',
    width: '100%',
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
  commentSectionWrapper: {
    width: '100%',
    marginTop: '12px',
  },
  commentsPanelFixed: {
    position: 'static',
    top: 0,
    right: 0,
    width: 520,
    maxWidth: '90vw',
    height: '90vh',
    marginTop: '3vh',
    background: '#fafbfc',
    boxShadow: '0 4px 24px rgba(30,32,44,0.08)',
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    animation: 'slideInRight 0.25s cubic-bezier(.4,1.3,.6,1) 1',
    border: 'none',
  },
  commentsPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 18px 6px 18px',
    background: 'transparent',
    borderTopLeftRadius: 22,
    borderBottom: 'none',
    minHeight: 36,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: 20,
    color: '#888',
    cursor: 'pointer',
    padding: 2,
    borderRadius: 6,
    transition: 'background 0.15s',
    lineHeight: 1,
    minWidth: 28,
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsPanelContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 0 0 0',
    background: 'transparent',
    borderBottomLeftRadius: 22,
  },
};
