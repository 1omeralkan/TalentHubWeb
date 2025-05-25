import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EditProfilePage = () => {
  const [form, setForm] = useState({ fullName: "", userName: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Kullanıcı bilgilerini çek
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          fullName: data.fullName || "",
          userName: data.userName || "",
          bio: data.bio || "",
        });
        if (data.profilePhotoUrl) setPhotoPreview(`http://localhost:5000${data.profilePhotoUrl}`);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    try {
      // Önce fotoğraf varsa yükle
      if (photo) {
        const formData = new FormData();
        formData.append("media", photo);
        const resPhoto = await fetch("http://localhost:5000/api/profile-photo", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const dataPhoto = await resPhoto.json();
        if (!resPhoto.ok) throw new Error(dataPhoto.message || "Fotoğraf yüklenemedi");
      }
      // Sonra diğer bilgileri güncelle
      const res = await fetch("http://localhost:5000/api/edit-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Profil başarıyla güncellendi!");
        setTimeout(() => navigate("/profile"), 1200);
      } else {
        setError(data.message || "Güncelleme başarısız!");
      }
    } catch (err) {
      setError(err.message || "Sunucu hatası!");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Profili Düzenle</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Ad Soyad</label>
          <input
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            required
            style={{...styles.input, ...(error ? {border: '1.5px solid #ef4444', boxShadow: '0 0 0 2px #ef444433'} : {})}}
          />
          <label style={styles.label}>Kullanıcı Adı</label>
          <input
            name="userName"
            type="text"
            value={form.userName}
            onChange={handleChange}
            required
            style={{...styles.input, ...(error ? {border: '1.5px solid #ef4444', boxShadow: '0 0 0 2px #ef444433'} : {})}}
          />
          <label style={styles.label}>Biyografi</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            style={{...styles.input, minHeight: 60, resize: 'vertical', ...(error ? {border: '1.5px solid #ef4444', boxShadow: '0 0 0 2px #ef444433'} : {})}}
            maxLength={200}
            placeholder="Kendini kısaca tanıt... (en fazla 200 karakter)"
          />
          <label style={styles.label}>Profil Fotoğrafı</label>
          {photoPreview && (
            <img src={photoPreview} alt="Profil Önizleme" style={styles.photoPreview} />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ marginBottom: "1rem" }}
          />
          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
        <button style={styles.cancelButton} onClick={() => navigate("/profile")}>İptal</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(120deg, #0A192F 60%, #112240 100%)",
    display: "flex",
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center",
    padding: '0 1rem',
  },
  card: {
    background: 'linear-gradient(135deg, #112240 90%, #192B3F 100%)',
    padding: "2.2rem 1.5rem 1.5rem 1.5rem",
    borderRadius: "20px",
    boxShadow: "0 8px 32px 0 #0A192F55, 0 0 0 2px #64FFDA33",
    width: "100%",
    maxWidth: "410px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: '1.5px solid #233554',
    color: '#E6F1FF',
    margin: '0 auto',
    marginTop: '3.5rem',
    marginBottom: '2.5rem',
  },
  title: {
    marginBottom: "1.3rem",
    textAlign: "center",
    fontWeight: 900,
    fontSize: "1.7rem",
    color: "#64FFDA",
    letterSpacing: "0.5px",
    fontFamily: 'Montserrat, sans-serif',
    textShadow: '0 2px 8px #0A192F44',
    marginTop: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "0.85rem",
    background: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    border: 'none',
    padding: 0,
    maxWidth: 410,
    margin: 0,
  },
  label: {
    fontSize: "1.01rem",
    marginBottom: "0.18rem",
    fontWeight: 700,
    color: "#64FFDA",
    letterSpacing: "0.1px",
    textShadow: '0 2px 8px #0A192F44',
  },
  input: {
    padding: "0.9rem 1.1rem",
    marginBottom: 0,
    borderRadius: "10px",
    border: "1.5px solid #233554",
    fontSize: "1.08rem",
    background: "#192B3F",
    transition: "border 0.18s, box-shadow 0.18s",
    outline: "none",
    fontWeight: 600,
    color: "#E6F1FF",
    boxShadow: "0 1px 4px #0A192F22",
  },
  button: {
    padding: "0.95rem",
    background: "linear-gradient(90deg, #64FFDA 0%, #4f46e5 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 800,
    fontSize: "1.13rem",
    cursor: "pointer",
    marginBottom: "0.4rem",
    marginTop: "0.5rem",
    letterSpacing: "0.1px",
    boxShadow: "0 2px 8px #64FFDA22",
    transition: "background 0.2s, box-shadow 0.2s",
    textShadow: '0 2px 8px #0A192F44',
  },
  cancelButton: {
    padding: "0.9rem",
    background: "#233554",
    color: "#64FFDA",
    border: "none",
    borderRadius: "10px",
    fontWeight: 800,
    cursor: "pointer",
    width: "100%",
    marginTop: "0.1rem",
    fontSize: "1.08rem",
    transition: "background 0.2s, color 0.2s",
    boxShadow: '0 2px 8px #64FFDA22',
    textShadow: '0 2px 8px #0A192F44',
    marginBottom: '0.5rem',
  },
  error: {
    color: "#ef4444",
    marginBottom: "0.5rem",
    textAlign: "center",
    fontSize: "1.01rem",
    fontWeight: 600,
  },
  success: {
    color: "#22c55e",
    marginBottom: "0.5rem",
    textAlign: "center",
    fontSize: "1.01rem",
    fontWeight: 600,
  },
  photoPreview: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    objectFit: "cover",
    margin: "0.3rem auto 1rem auto",
    boxShadow: "0 2px 8px #64FFDA33",
    display: "block",
    border: "2.5px solid #64FFDA",
    background: '#0A192F',
  },
};

export default EditProfilePage; 