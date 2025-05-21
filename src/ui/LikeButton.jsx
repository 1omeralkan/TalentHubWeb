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
  const fetchCountsAndStatus = async () => {
    if (!uploadId) return;
    // Like sayısı
    const likeRes = await fetch(`${API_BASE}/uploads/${uploadId}/likes`);
    const likeData = await likeRes.json();
    setLikeCount(likeData.count || 0);
    // Dislike sayısı
    const dislikeRes = await fetch(`${API_BASE}/uploads/${uploadId}/dislikes`);
    const dislikeData = await dislikeRes.json();
    setDislikeCount(dislikeData.count || 0);
    // Kullanıcı durumu
    if (userId) {
      const likedRes = await fetch(`${API_BASE}/uploads/${uploadId}/isLiked`, { headers: { Authorization: `Bearer ${token}` } });
      const likedData = await likedRes.json();
      setLiked(!!likedData.liked);
      const dislikedRes = await fetch(`${API_BASE}/uploads/${uploadId}/isDisliked`, { headers: { Authorization: `Bearer ${token}` } });
      const dislikedData = await dislikedRes.json();
      setDisliked(!!dislikedData.disliked);
    } else {
      setLiked(false);
      setDisliked(false);
    }
  };

  useEffect(() => {
    fetchCountsAndStatus();
    // eslint-disable-next-line
  }, [uploadId, token]);

  // Beğeni toggle
  const handleLike = async () => {
    if (!userId || loading) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/uploads/${uploadId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchCountsAndStatus();
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
      await fetch(`${API_BASE}/uploads/${uploadId}/dislike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchCountsAndStatus();
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