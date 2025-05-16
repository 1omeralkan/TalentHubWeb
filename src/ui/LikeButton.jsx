import React, { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const API_BASE = "http://localhost:5000/api";

const LikeButton = ({ uploadId }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Kullanıcı kimliğini JWT'den al
  let userId = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    } catch (err) {
      userId = null;
    }
  }

  // Beğeni sayısı ve kullanıcı beğenisi çek
  useEffect(() => {
    if (!uploadId) return;
    fetch(`${API_BASE}/uploads/${uploadId}/likes`)
      .then(res => res.json())
      .then(data => setCount(data.count || 0));
    if (userId) {
      fetch(`${API_BASE}/uploads/${uploadId}/isLiked`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setLiked(!!data.liked));
    }
  }, [uploadId, userId, token]);

  // Beğeni toggle
  const handleLike = async () => {
    if (!userId || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/uploads/${uploadId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.liked) {
        setLiked(true);
        setCount((c) => c + 1);
      } else {
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      // Hata yönetimi
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <button
        onClick={handleLike}
        disabled={!userId || loading}
        style={{
          background: "none",
          border: "none",
          outline: "none",
          cursor: userId ? "pointer" : "not-allowed",
          padding: 0,
          transition: "transform 0.1s",
          transform: liked ? "scale(1.15)" : "scale(1)",
        }}
        aria-label={liked ? "Beğenmekten vazgeç" : "Beğen"}
      >
        <FaHeart
          style={{
            fontSize: "2.1rem",
            color: liked ? "#e11d48" : "#444",
            filter: liked ? "drop-shadow(0 2px 8px #e11d48aa)" : "none",
            transition: "color 0.2s, filter 0.2s, transform 0.1s",
          }}
        />
      </button>
      <span style={{ fontSize: "1.08rem", color: liked ? "#e11d48" : "#222", fontWeight: 600, letterSpacing: 0.2 }}>{count}</span>
    </div>
  );
};

export default LikeButton; 