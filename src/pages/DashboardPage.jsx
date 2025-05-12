import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaUser, FaUpload, FaHome, FaPlusSquare, FaSearch, FaHeart, FaCommentDots, FaBookmark, FaShare, FaUserPlus } from "react-icons/fa";

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

  return (
    <div style={styles.tiktokMainArea}>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : videoItems.length === 0 ? (
        <p>Hiç video yok.</p>
      ) : (
        <div style={styles.tiktokVideoOuter}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
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
            <div style={styles.tiktokInfoBoxPro}>
              <div style={styles.userInfoContainer}>
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
            </div>
          </div>
          <div style={styles.tiktokActionBar}>
            <div style={styles.actionItem}><FaHeart style={styles.actionIcon} /><span style={styles.actionCount}>123</span></div>
            <div style={styles.actionItem}><FaCommentDots style={styles.actionIcon} /><span style={styles.actionCount}>45</span></div>
            <div style={styles.actionItem}><FaBookmark style={styles.actionIcon} /><span style={styles.actionCount}>12</span></div>
            <div style={styles.actionItem}><FaShare style={styles.actionIcon} /><span style={styles.actionCount}>7</span></div>
          </div>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2.5rem',
    width: '100%',
    maxWidth: '900px',
    minHeight: '80vh',
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    background: 'rgba(255,255,255,0.85)',
    borderRadius: '18px',
    padding: '1.2rem 0.7rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    minWidth: '60px',
    marginLeft: '1.2rem',
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
  },
  actionIcon: {
    fontSize: '2rem',
    marginBottom: '0.1rem',
  },
  actionCount: {
    fontSize: '1rem',
    color: '#222',
    fontWeight: 500,
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
};
