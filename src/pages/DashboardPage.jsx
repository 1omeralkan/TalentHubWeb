import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState({});
  const navigate = useNavigate();

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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleUploadRedirect = () => {
    navigate("/upload");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Dashboard</h2>
        <p style={styles.text}><strong>Hoş geldin:</strong> {user.email}</p>
        <p style={styles.text}><strong>Kullanıcı ID:</strong> {user.userId}</p>
        <p style={styles.message}>{message}</p>

        <button onClick={handleUploadRedirect} style={styles.secondaryButton}>
          Medya Yükle
        </button>

        <button onClick={handleLogout} style={styles.button}>
          Çıkış Yap
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
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "500px",
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  text: {
    fontSize: "1rem",
    marginBottom: "0.5rem",
  },
  message: {
    marginTop: "1rem",
    fontStyle: "italic",
    color: "#4f46e5",
  },
  button: {
    marginTop: "1rem",
    padding: "0.8rem",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
  secondaryButton: {
    marginTop: "1rem",
    padding: "0.8rem",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
};
