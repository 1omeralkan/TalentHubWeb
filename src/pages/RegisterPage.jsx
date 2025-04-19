import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Kayıt başarılı! Giriş yapabilirsiniz.");
      navigate("/login");
    } else {
      setError(data.message || "Kayıt başarısız!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Kayıt Ol</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Ad Soyad</label>
          <input
            name="fullName"
            type="text"
            placeholder="Adınız Soyadınız"
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Kullanıcı Adı</label>
          <input
            name="userName"
            type="text"
            placeholder="Kullanıcı adınız"
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Email adresiniz"
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Şifre</label>
          <input
            name="password"
            type="password"
            placeholder="Şifreniz"
            onChange={handleChange}
            required
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            Kayıt Ol
          </button>
        </form>

        <p style={styles.bottomText}>
          Zaten hesabınız var mı?{" "}
          <Link to="/login" style={styles.link}>
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

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
    backgroundColor: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
    textAlign: "center",
    fontSize: "0.9rem",
  },
  bottomText: {
    marginTop: "1rem",
    textAlign: "center",
    fontSize: "0.9rem",
  },
  link: {
    color: "#16a34a",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
