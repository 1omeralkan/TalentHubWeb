import React, { useEffect, useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const API_BASE = "http://localhost:5000/api";

const LikeButton = ({ uploadId }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
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

  // Beğeni ve beğenmeme sayısı + kullanıcı durumu çek
  useEffect(() => {
    setLiked(false);
    setDisliked(false);
    if (!uploadId) return;
    fetch(`${API_BASE}/uploads/${uploadId}/likes`)
      .then(res => res.json())
      .then(data => setLikeCount(data.count || 0));
    fetch(`${API_BASE}/uploads/${uploadId}/dislikes`)
      .then(res => res.json())
      .then(data => setDislikeCount(data.count || 0));
    if (userId) {
      fetch(`${API_BASE}/uploads/${uploadId}/isLiked`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setLiked(!!data.liked));
      fetch(`${API_BASE}/uploads/${uploadId}/isDisliked`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setDisliked(!!data.disliked));
    }
  }, [uploadId, token]);

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
      // Like aktifse dislike'ı kaldır
      if (data.liked) {
        setLiked(true);
        setDisliked(false);
        setLikeCount((c) => c + 1);
        if (disliked) setDislikeCount((c) => Math.max(0, c - 1));
      } else {
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      // Hata yönetimi
    } finally {
      setLoading(false);
    }
  };

  // Dislike toggle
  const handleDislike = async () => {
    if (!userId || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/uploads/${uploadId}/dislike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      // Dislike aktifse like'ı kaldır
      if (data.disliked) {
        setDisliked(true);
        setLiked(false);
        setDislikeCount((c) => c + 1);
        if (liked) setLikeCount((c) => Math.max(0, c - 1));
      } else {
        setDisliked(false);
        setDislikeCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      // Hata yönetimi
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <button
        onClick={handleLike}
        disabled={!userId || loading}
        style={{
          background: "none",
          border: "none",
          outline: "none",
          cursor: userId ? "pointer" : "not-allowed",
          padding: 0,
          borderRadius: 16,
          transition: "transform 0.12s cubic-bezier(.4,2,.6,1), box-shadow 0.18s",
          transform: liked ? "scale(1.15)" : "scale(1)",
          boxShadow: liked ? "0 2px 16px #6366f155" : "none",
          position: "relative"
        }}
        aria-label={liked ? "Beğenmekten vazgeç" : "Beğen"}
      >
        <FaThumbsUp
          style={{
            fontSize: "2.1rem",
            color: liked ? "#4f46e5" : "#444",
            filter: liked ? "drop-shadow(0 2px 8px #6366f1aa)" : "none",
            transition: "color 0.2s, filter 0.2s, transform 0.1s",
            opacity: loading ? 0.5 : 1,
          }}
        />
        {loading && (
          <span style={{ position: "absolute", right: -28, top: 8 }}>
            <span className="loader" style={{ width: 16, height: 16, border: "2px solid #4f46e5", borderTop: "2px solid transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
          </span>
        )}
      </button>
      <span style={{ fontSize: "1.08rem", color: liked ? "#4f46e5" : "#222", fontWeight: 600, letterSpacing: 0.2 }}>{likeCount}</span>
      <button
        onClick={handleDislike}
        disabled={!userId || loading}
        style={{
          background: "none",
          border: "none",
          outline: "none",
          cursor: userId ? "pointer" : "not-allowed",
          padding: 0,
          borderRadius: 16,
          marginTop: 8,
          transition: "transform 0.12s cubic-bezier(.4,2,.6,1), box-shadow 0.18s",
          transform: disliked ? "scale(1.15)" : "scale(1)",
          boxShadow: disliked ? "0 2px 16px #6366f155" : "none",
          position: "relative"
        }}
        aria-label={disliked ? "Beğenmemeyi geri al" : "Beğenme (dislike)"}
      >
        <FaThumbsDown
          style={{
            fontSize: "2.1rem",
            color: disliked ? "#a21caf" : "#bbb",
            filter: disliked ? "drop-shadow(0 2px 8px #a21caf88)" : "none",
            transition: "color 0.2s, filter 0.2s, transform 0.1s",
            opacity: loading ? 0.5 : 1,
          }}
        />
      </button>
      <span style={{ fontSize: "1.08rem", color: disliked ? "#a21caf" : "#bbb", fontWeight: 600, letterSpacing: 0.2 }}>{dislikeCount}</span>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LikeButton; 