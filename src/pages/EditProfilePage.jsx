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
    background: "linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#fff",
    padding: "2.5rem 2rem 2rem 2rem",
    borderRadius: "18px",
    boxShadow: "0 6px 32px 0 rgba(79,70,229,0.10)",
    width: "100%",
    maxWidth: "410px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    marginBottom: "1.7rem",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "1.5rem",
    color: "#4f46e5",
    letterSpacing: "0.5px",
    fontFamily: 'Montserrat, sans-serif',
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "0.7rem",
  },
  label: {
    fontSize: "0.97rem",
    marginBottom: "0.2rem",
    fontWeight: 600,
    color: "#4f46e5",
    letterSpacing: "0.2px",
  },
  input: {
    padding: "0.85rem 1rem",
    marginBottom: 0,
    borderRadius: "8px",
    border: "1.5px solid #e0e7ff",
    fontSize: "1rem",
    background: "#f8fafc",
    transition: "border 0.2s, box-shadow 0.2s",
    outline: "none",
    fontWeight: 500,
    color: "#222",
    boxShadow: "0 1px 2px rgba(79,70,229,0.03)",
  },
  button: {
    padding: "0.95rem",
    background: "linear-gradient(90deg, #6366f1 60%, #818cf8 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "1.08rem",
    cursor: "pointer",
    marginBottom: "0.5rem",
    marginTop: "0.7rem",
    letterSpacing: "0.2px",
    boxShadow: "0 2px 8px rgba(99,102,241,0.10)",
    transition: "background 0.2s, box-shadow 0.2s",
  },
  cancelButton: {
    padding: "0.8rem",
    background: "#e0e7ff",
    color: "#4f46e5",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    marginTop: "0.2rem",
    fontSize: "1.02rem",
    transition: "background 0.2s, color 0.2s",
  },
  error: {
    color: "#ef4444",
    marginBottom: "0.7rem",
    textAlign: "center",
    fontSize: "0.97rem",
    fontWeight: 500,
  },
  success: {
    color: "#22c55e",
    marginBottom: "0.7rem",
    textAlign: "center",
    fontSize: "0.97rem",
    fontWeight: 500,
  },
  photoPreview: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    objectFit: "cover",
    margin: "0.5rem auto 1rem auto",
    boxShadow: "0 2px 8px rgba(99,102,241,0.10)",
    display: "block",
    border: "3px solid #e0e7ff",
  },
};

export default EditProfilePage; 