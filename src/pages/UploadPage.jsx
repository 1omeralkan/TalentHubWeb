import React, { useState } from "react";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");

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
      <h2>Medya Yükle</h2>
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
  );
};

export default UploadPage;

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "0.5rem",
    fontWeight: "bold",
  },
  input: {
    marginBottom: "1rem",
  },
  textarea: {
    marginBottom: "1rem",
    padding: "0.5rem",
    height: "100px",
    resize: "vertical",
  },
  button: {
    backgroundColor: "#22c55e",
    color: "#fff",
    padding: "10px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
