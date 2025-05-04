import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaUser, FaUpload, FaHome } from "react-icons/fa";

const ProfilPage = () => {
  const [user, setUser] = useState({});
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
  }, [navigate]);

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
        <div style={styles.logoutButton} onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}>
          <FaUser style={styles.themeIcon} />
          <span>Çıkış Yap</span>
        </div>
      </div>
      <div style={styles.mainContent}>
        <div style={styles.card}>
          <h2 style={styles.title}>Profil Bilgileri</h2>
          <div style={styles.infoContainer}>
            <p style={styles.text}><strong>E-posta:</strong> {user.email}</p>
            <p style={styles.text}><strong>Kullanıcı ID:</strong> {user.userId}</p>
          </div>
        </div>
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
                  {item.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={`http://localhost:5000${item.mediaUrl}`} controls style={styles.media} />
                  ) : (
                    <img src={`http://localhost:5000${item.mediaUrl}`} alt="Yetenek" style={styles.media} />
                  )}
                  <div style={styles.caption}>{item.caption}</div>
                  <div style={styles.date}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilPage;

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
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "500px",
    marginBottom: "2rem",
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  infoContainer: {
    marginTop: "1rem",
  },
  text: {
    fontSize: "1rem",
    marginBottom: "0.5rem",
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