import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);

  useEffect(() => {
    setAnimateCard(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "Bir hata oluştu.");
    } catch (err) {
      setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundBlob}></div>
      <div style={styles.backgroundBlob2}></div>
      <div style={styles.backgroundWave}></div>
      <div style={{
        ...styles.card,
        opacity: animateCard ? 1 : 0,
        transform: animateCard ? 'translateY(0)' : 'translateY(20px)',
      }}>
        <Link to="/login" style={styles.backButton}>
          <FaArrowLeft style={{marginRight: 8}} />
          Giriş Sayfasına Dön
        </Link>
        <div style={styles.iconCircle}>
          <FaEnvelope size={26} color="#fff" />
        </div>
        <h2 style={styles.title}>Şifremi Unuttum</h2>
        <p style={styles.subtitle}>Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <FaEnvelope style={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                disabled={isLoading}
              />
            </div>
          </div>
          {message && (
            <div style={{
              ...styles.message,
              background: message.includes("başarılı") ? "#f0fdf4" : "#fef2f2",
              border: message.includes("başarılı") ? "1px solid #bbf7d0" : "1px solid #fecaca",
              color: message.includes("başarılı") ? "#166534" : "#991b1b",
            }}>
              {message}
            </div>
          )}
          <button 
            type="submit" 
            style={{
              ...styles.button,
              opacity: isLoading ? 0.8 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={styles.loadingSpinner}></div>
            ) : (
              'Şifre Sıfırlama Bağlantısı Gönder'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f6f7fb 0%, #e0e7ff 100%)",
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
    animation: "float 8s ease-in-out infinite",
  },
  backgroundBlob2: {
    position: "absolute",
    bottom: "-100px",
    right: "-120px",
    width: 380,
    height: 380,
    background: "radial-gradient(circle at 40% 60%, #818cf8 0%, #4f46e5 80%, transparent 100%)",
    filter: "blur(70px)",
    opacity: 0.35,
    zIndex: 0,
    animation: "float 12s ease-in-out infinite reverse",
  },
  backgroundWave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 90,
    zIndex: 0,
    background: "url('data:image/svg+xml;utf8,<svg width=\'100%\' height=\'90\' viewBox=\'0 0 1440 90\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M0 0h1440v60c-120 20-360 40-720 0S120 80 0 60V0z\' fill=\'%234f46e5\' fill-opacity=\'0.08\'/></svg>') repeat-x bottom",
    animation: "wave 20s linear infinite",
  },
  card: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "2.5rem 2rem 2rem 2rem",
    borderRadius: "24px",
    boxShadow: "0 8px 32px rgba(79,70,229,0.12)",
    border: "1px solid rgba(255,255,255,0.8)",
    backdropFilter: "blur(8px)",
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  backButton: {
    position: "absolute",
    top: "1.5rem",
    left: "1.5rem",
    color: "#6366f1",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
    transition: "all 0.2s",
    background: "rgba(99,102,241,0.1)",
  },
  iconCircle: {
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    borderRadius: "50%",
    width: 52,
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    boxShadow: "0 4px 12px rgba(99,102,241,0.2)",
    border: "2px solid #fff",
    position: "absolute",
    top: -26,
    left: "50%",
    transform: "translateX(-50%)",
    animation: "pulse 2s infinite",
  },
  title: {
    marginBottom: "0.5rem",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "1.75rem",
    letterSpacing: "0.5px",
    color: "#1e293b",
    marginTop: 32,
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#6366f1",
    fontWeight: 500,
    fontSize: "1rem",
    marginBottom: "1.5rem",
    textAlign: "center",
    maxWidth: "320px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "1.2rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#4b5563",
    marginLeft: "0.2rem",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    color: "#a5b4fc",
    fontSize: "1.1rem",
    zIndex: 2,
    transition: "color 0.2s",
  },
  input: {
    padding: "0.85rem 1rem 0.85rem 2.8rem",
    borderRadius: "12px",
    border: "1.5px solid #e5e7eb",
    fontSize: "1rem",
    background: "#f8fafc",
    transition: "all 0.2s",
    outline: "none",
    width: "100%",
    boxShadow: "0 1px 2px rgba(99,102,241,0.05)",
  },
  button: {
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    color: "#fff",
    padding: "1rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1.05rem",
    boxShadow: "0 4px 12px rgba(99,102,241,0.2)",
    transition: "all 0.2s",
    marginTop: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "48px",
  },
  loadingSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid #ffffff",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  message: {
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 500,
    textAlign: "center",
    animation: "fadeIn 0.3s ease-out",
  },
  "@keyframes float": {
    "0%, 100%": {
      transform: "translateY(0)",
    },
    "50%": {
      transform: "translateY(-20px)",
    },
  },
  "@keyframes wave": {
    "0%": {
      backgroundPosition: "0% 0%",
    },
    "100%": {
      backgroundPosition: "100% 0%",
    },
  },
  "@keyframes pulse": {
    "0%": {
      boxShadow: "0 0 0 0 rgba(99,102,241,0.4)",
    },
    "70%": {
      boxShadow: "0 0 0 10px rgba(99,102,241,0)",
    },
    "100%": {
      boxShadow: "0 0 0 0 rgba(99,102,241,0)",
    },
  },
  "@keyframes spin": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(-10px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
};
