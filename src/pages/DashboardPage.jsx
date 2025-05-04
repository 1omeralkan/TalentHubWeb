import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaUser, FaUpload, FaHome } from "react-icons/fa";

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [exploreItems, setExploreItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef([]);

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

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Menü</h3>
        </div>
        <div style={styles.sidebarMenu}>
          <Link 
            to="/dashboard" 
            style={{
              ...styles.sidebarItem,
              ...(isActive("/dashboard") && styles.activeItem)
            }}
          >
            <FaHome style={styles.icon} />
            <span>Ana Sayfa</span>
          </Link>
          <Link 
            to="/profile" 
            style={{
              ...styles.sidebarItem,
              ...(isActive("/profile") && styles.activeItem)
            }}
          >
            <FaUser style={styles.icon} />
            <span>Profil</span>
          </Link>
          <Link 
            to="/upload" 
            style={{
              ...styles.sidebarItem,
              ...(isActive("/upload") && styles.activeItem)
            }}
          >
            <FaUpload style={styles.icon} />
            <span>Medya Yükle</span>
          </Link>
        </div>
        <div style={styles.logoutButton} onClick={handleLogout}>
          <FaUser style={styles.themeIcon} />
          <span>Çıkış Yap</span>
        </div>
      </div>
      <div style={styles.mainContent}>
        <div style={styles.tiktokContainer}>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : videoItems.length === 0 ? (
            <p>Hiç video yok.</p>
          ) : (
            <div style={styles.tiktokVideoWrapper}>
              <video
                ref={el => videoRefs.current[activeIndex] = el}
                src={`http://localhost:5000${videoItems[activeIndex].mediaUrl}`}
                style={styles.tiktokVideo}
                controls
                autoPlay
                loop
              />
              <div style={styles.tiktokInfoBox}>
                <div style={styles.infoCaption}>{videoItems[activeIndex].caption}</div>
                <div style={styles.infoMeta}>
                  <span style={styles.infoUser}>Kullanıcı ID: {videoItems[activeIndex].userId}</span>
                  <span style={styles.infoDate}>
                    {new Date(videoItems[activeIndex].createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <button onClick={handleUploadRedirect} style={styles.uploadButton}>
          Medya Yükle
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
    display: "flex",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#fff",
    boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
    padding: "1rem",
    position: "sticky",
    top: 0,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: "1rem 0",
    borderBottom: "1px solid #eee",
  },
  sidebarTitle: {
    margin: 0,
    color: "#333",
  },
  sidebarMenu: {
    marginTop: "1rem",
    flex: 1,
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    padding: "0.8rem 1rem",
    color: "#333",
    textDecoration: "none",
    borderRadius: "5px",
    marginBottom: "0.5rem",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#f0f0f0",
    },
  },
  activeItem: {
    backgroundColor: "#4f46e5",
    color: "#fff",
  },
  icon: {
    marginRight: "0.8rem",
    fontSize: "1.2rem",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    padding: "0.8rem 1rem",
    color: "#ef4444",
    cursor: "pointer",
    borderRadius: "5px",
    marginTop: "0.5rem",
    fontWeight: "bold",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#ffe4e6",
    },
  },
  mainContent: {
    flex: 1,
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  tiktokContainer: {
    width: "100vw",
    height: "100vh",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  },
  tiktokVideoWrapper: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  tiktokVideo: {
    width: "100vw",
    maxWidth: "420px",
    maxHeight: "80vh",
    borderRadius: "18px",
    background: "#000",
    objectFit: "contain",
    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
  },
  tiktokInfoBox: {
    position: "absolute",
    top: "24px",
    left: "24px",
    background: "rgba(20,20,20,0.55)",
    color: "#fff",
    borderRadius: "10px",
    padding: "10px 18px 8px 14px",
    minWidth: "220px",
    maxWidth: "340px",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    fontSize: "1rem",
    fontWeight: 400,
    boxShadow: "none"
  },
  infoCaption: {
    fontWeight: 500,
    fontSize: "1.08rem",
    marginBottom: "4px",
    whiteSpace: "pre-line",
    wordBreak: "break-word"
  },
  infoMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontSize: "0.95rem",
    color: "#e0e0e0"
  },
  infoUser: {
    fontWeight: 400,
    color: "#b3aaff"
  },
  infoDate: {
    color: "#ccc",
    fontSize: "0.92rem"
  },
  uploadButton: {
    width: "100%",
    maxWidth: "600px",
    padding: "1rem",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "1.1rem",
    cursor: "pointer",
    marginTop: "0",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
};
