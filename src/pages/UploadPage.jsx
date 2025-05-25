import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaUser, FaUpload, FaHome, FaCloudUploadAlt, FaFileImage, FaRegCommentDots } from "react-icons/fa";

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

  const MAX_CAPTION = 180;

  return (
    <div style={styles.container}>
      <div style={styles.backgroundBlob}></div>
      <div style={styles.backgroundWave}></div>
        <div style={styles.card}>
        <div style={styles.iconCircle}><FaCloudUploadAlt size={22} color="#6366f1" /></div>
          <h2 style={styles.title}>Medya Yükle</h2>
        <p style={styles.subtitle}>Yeteneklerini paylaş, ilham ver!</p>
      <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Dosya Seç</label>
          <div style={styles.inputWrapper}>
            <FaFileImage style={styles.inputIcon} />
            <label htmlFor="file-upload" style={styles.fileButton}>
        <input
                id="file-upload"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
                style={{ display: "none" }}
        />
              {file ? file.name : "Dosya seç (video/fotoğraf)"}
            </label>
          </div>
          <label style={styles.label}>Açıklama</label>
          <div style={styles.inputWrapper}>
            <FaRegCommentDots style={styles.inputIcon} />
        <textarea
          value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
          placeholder="Yetenek hakkında kısa bir açıklama..."
          style={styles.textarea}
              maxLength={MAX_CAPTION}
        />
          </div>
          <div style={styles.captionCount}>{caption.length}/{MAX_CAPTION}</div>
          <button type="submit" style={styles.button} onMouseOver={e=>e.currentTarget.style.background="linear-gradient(90deg,#6366f1,#22c55e)"} onMouseOut={e=>e.currentTarget.style.background="linear-gradient(90deg,#22c55e,#6366f1)"}>
            <FaCloudUploadAlt style={{marginRight:8,marginBottom:-2}}/> Yükle
          </button>
      </form>
      </div>
    </div>
  );
};

export default UploadPage;

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0A192F 70%, #112240 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  backgroundBlob: {
    position: "absolute",
    top: "-100px",
    left: "-120px",
    width: 320,
    height: 320,
    background: "radial-gradient(circle at 60% 40%, #64FFDA 0%, #4f46e5 80%, transparent 100%)",
    filter: "blur(70px)",
    opacity: 0.22,
    zIndex: 0,
  },
  backgroundWave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 70,
    zIndex: 0,
    background: "url('data:image/svg+xml;utf8,<svg width=\'100%\' height=\'70\' viewBox=\'0 0 1440 70\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M0 0h1440v40c-120 20-360 30-720 0S120 60 0 40V0z\' fill=\'%2364FFDA\' fill-opacity=\'0.07\'/></svg>') repeat-x bottom" ,
  },
  card: {
    background: 'linear-gradient(135deg, #112240 80%, #233554 100%)',
    padding: "2.5rem 2.2rem 2.2rem 2.2rem",
    borderRadius: "22px",
    boxShadow: "0 8px 36px #64FFDA22, 0 0 0 2px #64FFDA33",
    border: "2px solid #233554",
    width: "100%",
    maxWidth: "430px",
    minWidth: "320px",
    minHeight: "420px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
    justifyContent: "center",
  },
  iconCircle: {
    background: "linear-gradient(135deg,#64FFDA 60%,#4f46e5 100%)",
    borderRadius: "50%",
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    boxShadow: "0 1px 8px #64FFDA33",
    border: "2.5px solid #fff",
    position: "absolute",
    top: -22,
    left: "50%",
    transform: "translateX(-50%)",
  },
  title: {
    marginBottom: "0.3rem",
    textAlign: "center",
    fontWeight: 800,
    fontSize: "1.45rem",
    letterSpacing: "0.3px",
    color: "#64FFDA",
    marginTop: 28,
    textShadow: '0 2px 8px #0A192F44',
  },
  subtitle: {
    color: "#4f46e5",
    fontWeight: 600,
    fontSize: "1.01rem",
    marginBottom: "1.1rem",
    textAlign: "center",
    letterSpacing: 0.1,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "1.15rem",
    maxWidth: 400,
    margin: "0 auto",
  },
  label: {
    fontSize: "1.07rem",
    marginBottom: "0.18rem",
    fontWeight: 700,
    color: "#64FFDA",
    letterSpacing: "0.1px",
    textShadow: '0 2px 8px #0A192F44',
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginBottom: "0.1rem",
    width: '100%',
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    color: "#64FFDA",
    fontSize: "1.13rem",
    zIndex: 2,
  },
  fileButton: {
    width: "100%",
    padding: "1.05rem 1.2rem 1.05rem 2.5rem",
    borderRadius: "12px",
    border: "2px solid #64FFDA44",
    fontSize: "1.09rem",
    background: "#192B3F",
    color: "#E6F1FF",
    fontWeight: 700,
    cursor: "pointer",
    transition: "border 0.18s, box-shadow 0.18s, background 0.18s",
    outline: "none",
    boxShadow: "0 1.5px 5px #64FFDA11",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  input: {
    display: "none",
  },
  textarea: {
    padding: "1.05rem 1.2rem 1.05rem 2.5rem",
    height: "90px",
    resize: "vertical",
    borderRadius: "12px",
    border: "2px solid #64FFDA44",
    fontSize: "1.09rem",
    background: "#192B3F",
    transition: "border 0.18s, box-shadow 0.18s",
    outline: "none",
    width: "100%",
    color: '#E6F1FF',
    fontWeight: 600,
    boxShadow: "0 1.5px 5px #64FFDA11",
  },
  captionCount: {
    textAlign: "right",
    fontSize: "0.95rem",
    color: "#64FFDA",
    marginTop: "-0.5rem",
    marginBottom: "0.2rem",
    fontWeight: 700,
    letterSpacing: 0.1,
  },
  button: {
    background: "linear-gradient(90deg,#64FFDA,#4f46e5)",
    color: "#fff",
    padding: "1.1rem 0.5rem",
    fontWeight: 800,
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1.13rem",
    boxShadow: "0 2px 12px #64FFDA22",
    transition: "background 0.2s, box-shadow 0.2s",
    marginTop: "0.3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    letterSpacing: "0.2px",
    textShadow: '0 2px 8px #0A192F44',
  },
  '@media (max-width: 600px)': {
    card: {
      maxWidth: '98vw',
      padding: '1.1rem 0.5rem',
    },
    form: {
      maxWidth: '98vw',
    },
  },
};
