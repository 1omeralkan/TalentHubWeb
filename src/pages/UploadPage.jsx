import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaUser, FaUpload, FaHome } from "react-icons/fa";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Lütfen bir dosya seçin.");
      return;
    }

    const formData = new FormData();
    formData.append("media", file);
    formData.append("caption", caption);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Yükleme başarılı!");
        setFile(null);
        setCaption("");
      } else {
        alert(data.message || "Yükleme başarısız!");
      }
    } catch (err) {
      console.error("Yükleme hatası:", err);
      alert("Yükleme sırasında hata oluştu.");
    }
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
          <h2 style={styles.title}>Medya Yükle</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Dosya Seç (video veya fotoğraf):</label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={styles.input}
        />

        <label style={styles.label}>Açıklama:</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Yetenek hakkında kısa bir açıklama..."
          style={styles.textarea}
        />

        <button type="submit" style={styles.button}>Yükle</button>
      </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;

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
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2.5rem 2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    width: "100%",
    maxWidth: "540px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: "2rem",
    fontSize: "2rem",
    fontWeight: "bold",
    letterSpacing: "0.5px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "1.2rem",
  },
  label: {
    marginBottom: "0.5rem",
    fontWeight: "bold",
    fontSize: "1.1rem",
  },
  input: {
    marginBottom: "0.5rem",
    padding: "0.7rem 1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    transition: "border 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  textarea: {
    marginBottom: "0.5rem",
    padding: "0.7rem 1rem",
    height: "100px",
    resize: "vertical",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    transition: "border 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  button: {
    backgroundColor: "#22c55e",
    color: "#fff",
    padding: "1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1.1rem",
    boxShadow: "0 2px 8px rgba(34,197,94,0.10)",
    transition: "background 0.2s, box-shadow 0.2s",
  },
};
