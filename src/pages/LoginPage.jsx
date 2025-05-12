import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUserAlt, FaEnvelope, FaLock } from "react-icons/fa";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else {
      setError(data.message || "Giriş başarısız!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundBlob}></div>
      <div style={styles.backgroundWave}></div>
      <div style={styles.card}>
        <div style={styles.iconCircle}><FaUserAlt size={26} color="#4f46e5" /></div>
        <h2 style={styles.title}>Giriş Yap</h2>
        <p style={styles.subtitle}>TalentHub'a hoş geldin! Lütfen giriş yap.</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <div style={styles.inputWrapper}>
            <FaEnvelope style={styles.inputIcon} />
            <input
              name="email"
              type="email"
              placeholder="Email adresiniz"
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <label style={styles.label}>Şifre</label>
          <div style={styles.inputWrapper}>
            <FaLock style={styles.inputIcon} />
            <input
              name="password"
              type="password"
              placeholder="Şifreniz"
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          {error && <div style={styles.error}><FaUserAlt style={{marginRight:6}}/>{error}</div>}
          <button type="submit" style={styles.button} onMouseOver={e=>e.currentTarget.style.background="linear-gradient(90deg,#6366f1,#4f46e5)"} onMouseOut={e=>e.currentTarget.style.background="linear-gradient(90deg,#4f46e5,#6366f1)"}>
            Giriş Yap
          </button>
        </form>
        <p style={styles.bottomText}>
          Hesabınız yok mu?{" "}
          <Link to="/register" style={styles.link}>
            Kayıt Ol
          </Link>
        </p>
        <p style={styles.bottomText}>
          <Link to="/forgot-password" style={styles.link}>
            Şifreni mi unuttun?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(120deg,#e0e7ff 0%,#f6f7fb 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  backgroundBlob: {
    position: "absolute",
    top: "-120px",
    left: "-100px",
    width: 340,
    height: 340,
    background: "radial-gradient(circle at 60% 40%, #a5b4fc 0%, #6366f1 80%, transparent 100%)",
    filter: "blur(60px)",
    opacity: 0.45,
    zIndex: 0,
  },
  backgroundWave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 90,
    zIndex: 0,
    background: "url('data:image/svg+xml;utf8,<svg width=\'100%\' height=\'90\' viewBox=\'0 0 1440 90\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M0 0h1440v60c-120 20-360 40-720 0S120 80 0 60V0z\' fill=\'%234f46e5\' fill-opacity=\'0.08\'/></svg>') repeat-x bottom" ,
  },
  card: {
    background: "#fff",
    padding: "2rem 1.3rem 1.5rem 1.3rem",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(79,70,229,0.10)",
    border: "1.2px solid #ede9fe",
    width: "100%",
    maxWidth: "340px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  iconCircle: {
    background: "linear-gradient(135deg,#6366f1 60%,#a5b4fc 100%)",
    borderRadius: "50%",
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    boxShadow: "0 2px 8px rgba(99,102,241,0.10)",
    border: "2px solid #fff",
    position: "absolute",
    top: -22,
    left: "50%",
    transform: "translateX(-50%)",
  },
  title: {
    marginBottom: "0.5rem",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "1.45rem",
    letterSpacing: "0.5px",
    color: "#18181b",
    marginTop: 28,
  },
  subtitle: {
    color: "#6366f1",
    fontWeight: 500,
    fontSize: "0.98rem",
    marginBottom: "1.1rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "0.8rem",
  },
  label: {
    fontSize: "0.97rem",
    marginBottom: "0.25rem",
    fontWeight: 600,
    color: "#22223b",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    color: "#a5b4fc",
    fontSize: "1rem",
    zIndex: 2,
  },
  input: {
    padding: "0.7rem 0.9rem 0.7rem 2.1rem",
    borderRadius: "8px",
    border: "1.2px solid #e5e7eb",
    fontSize: "0.98rem",
    background: "#f8fafc",
    transition: "border 0.2s, box-shadow 0.2s",
    outline: "none",
    marginBottom: "0.1rem",
    width: "100%",
    boxShadow: "0 1px 3px rgba(99,102,241,0.03)",
  },
  button: {
    background: "linear-gradient(90deg,#4f46e5,#6366f1)",
    color: "#fff",
    padding: "0.8rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    boxShadow: "0 2px 8px rgba(99,102,241,0.10)",
    transition: "background 0.2s, box-shadow 0.2s",
    marginTop: "0.4rem",
  },
  error: {
    color: "#ef4444",
    marginBottom: "0.5rem",
    textAlign: "center",
    fontSize: "0.95rem",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#fef2f2",
    borderRadius: 7,
    padding: "0.4rem 0.8rem",
    border: "1.2px solid #fecaca",
    animation: "shake 0.2s",
  },
  bottomText: {
    marginTop: "0.9rem",
    textAlign: "center",
    fontSize: "0.97rem",
    color: "#444",
  },
  link: {
    color: "#4f46e5",
    textDecoration: "underline",
    fontWeight: 700,
    transition: "color 0.2s",
    cursor: "pointer",
  },
};
