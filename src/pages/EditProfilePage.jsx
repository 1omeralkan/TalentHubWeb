import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EditProfilePage = () => {
  const [form, setForm] = useState({ fullName: "", userName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        });
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    try {
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
      setError("Sunucu hatası!");
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
            style={styles.input}
          />
          <label style={styles.label}>Kullanıcı Adı</label>
          <input
            name="userName"
            type="text"
            value={form.userName}
            onChange={handleChange}
            required
            style={styles.input}
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
    backgroundColor: "#f4f4f4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.9rem",
    marginBottom: "0.3rem",
    fontWeight: "bold",
  },
  input: {
    padding: "0.8rem",
    marginBottom: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    padding: "0.9rem",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "0.5rem",
  },
  cancelButton: {
    padding: "0.7rem",
    backgroundColor: "#888",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
    textAlign: "center",
    fontSize: "0.9rem",
  },
  success: {
    color: "green",
    marginBottom: "1rem",
    textAlign: "center",
    fontSize: "0.9rem",
  },
};

export default EditProfilePage; 