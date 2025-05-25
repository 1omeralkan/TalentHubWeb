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
    background: "linear-gradient(135deg, #0A192F 70%, #112240 100%)",
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
    background: "radial-gradient(circle at 60% 40%, #64FFDA 0%, #4f46e5 80%, transparent 100%)",
    filter: "blur(70px)",
    opacity: 0.22,
    zIndex: 0,
    animation: "float 8s ease-in-out infinite",
  },
  backgroundBlob2: {
    position: "absolute",
    bottom: "-100px",
    right: "-120px",
    width: 380,
    height: 380,
    background: "radial-gradient(circle at 40% 60%, #4f46e5 0%, #64FFDA 80%, transparent 100%)",
    filter: "blur(80px)",
    opacity: 0.18,
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
    background: "url('data:image/svg+xml;utf8,<svg width=\'100%\' height=\'90\' viewBox=\'0 0 1440 90\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M0 0h1440v60c-120 20-360 40-720 0S120 80 0 60V0z\' fill=\'%2364FFDA\' fill-opacity=\'0.08\'/></svg>') repeat-x bottom",
    animation: "wave 20s linear infinite",
  },
  card: {
    background: "linear-gradient(135deg, #112240 80%, #233554 100%)",
    padding: "2.7rem 2.2rem 2.2rem 2.2rem",
    borderRadius: "22px",
    boxShadow: "0 8px 36px #64FFDA22, 0 0 0 2px #64FFDA33",
    border: "2px solid #233554",
    backdropFilter: "blur(8px)",
    width: "100%",
    maxWidth: "410px",
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
    color: "#64FFDA",
    textDecoration: "none",
    fontSize: "0.99rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    borderRadius: "12px",
    transition: "all 0.2s",
    background: "rgba(100,255,218,0.08)",
    border: "1.5px solid #64FFDA44",
    boxShadow: "0 1.5px 8px #64FFDA22",
  },
  iconCircle: {
    background: "linear-gradient(135deg,#64FFDA 60%,#4f46e5 100%)",
    borderRadius: "50%",
    width: 54,
    height: 54,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    boxShadow: "0 4px 16px #64FFDA33",
    border: "2.5px solid #fff",
    position: "absolute",
    top: -27,
    left: "50%",
    transform: "translateX(-50%)",
    animation: "pulse 2s infinite",
  },
  title: {
    marginBottom: "0.5rem",
    textAlign: "center",
    fontWeight: 800,
    fontSize: "1.55rem",
    letterSpacing: "0.5px",
    color: "#64FFDA",
    marginTop: 36,
    textShadow: "0 2px 8px #0A192F44",
  },
  subtitle: {
    color: "#E6F1FF",
    fontWeight: 600,
    fontSize: "1.07rem",
    marginBottom: "1.5rem",
    textAlign: "center",
    maxWidth: "320px",
    textShadow: "0 2px 8px #0A192F44",
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
    fontSize: "1.01rem",
    fontWeight: 700,
    color: "#64FFDA",
    marginLeft: "0.2rem",
    textShadow: "0 2px 8px #0A192F44",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    color: "#64FFDA",
    fontSize: "1.13rem",
    zIndex: 2,
    transition: "color 0.2s",
  },
  input: {
    padding: "1.05rem 1.2rem 1.05rem 2.7rem",
    borderRadius: "14px",
    border: "2px solid #64FFDA44",
    fontSize: "1.09rem",
    background: "#192B3F",
    transition: "all 0.2s",
    outline: "none",
    width: "100%",
    color: "#E6F1FF",
    fontWeight: 600,
    boxShadow: "0 1.5px 5px #64FFDA11",
  },
  button: {
    background: "linear-gradient(90deg,#64FFDA,#4f46e5)",
    color: "#fff",
    padding: "1.1rem 0.5rem",
    fontWeight: 800,
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "1.13rem",
    boxShadow: "0 2px 12px #64FFDA22",
    transition: "background 0.2s, box-shadow 0.2s",
    marginTop: "0.3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "48px",
    letterSpacing: "0.2px",
    textShadow: "0 2px 8px #0A192F44",
  },
  loadingSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid #64FFDA",
    borderTop: "2px solid #4f46e5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  message: {
    padding: "0.85rem 1.1rem",
    borderRadius: "12px",
    fontSize: "1.01rem",
    fontWeight: 700,
    textAlign: "center",
    animation: "fadeIn 0.3s ease-out",
    boxShadow: "0 2px 12px #64FFDA11",
    marginBottom: "-0.5rem",
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
      boxShadow: "0 0 0 0 #64FFDA66",
    },
    "70%": {
      boxShadow: "0 0 0 10px #64FFDA00",
    },
    "100%": {
      boxShadow: "0 0 0 0 #64FFDA00",
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
