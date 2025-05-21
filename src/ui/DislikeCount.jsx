import React, { useEffect, useState } from "react";
import { FaThumbsDown } from "react-icons/fa";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const DislikeCount = ({ uploadId }) => {
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [dislikers, setDislikers] = useState([]);
  const [loadingDislikers, setLoadingDislikers] = useState(false);

  useEffect(() => {
    if (!uploadId) return;
    fetch(`${API_BASE}/uploads/${uploadId}/dislikes`)
      .then(res => res.json())
      .then(data => setCount(data.count || 0));
  }, [uploadId]);

  const handleShowDislikers = async () => {
    setShowModal(true);
    setLoadingDislikers(true);
    try {
      const res = await fetch(`${API_BASE}/uploads/${uploadId}/dislikers`);
      const data = await res.json();
      setDislikers((data.users || []).filter(Boolean));
    } catch (err) {
      setDislikers([]);
    } finally {
      setLoadingDislikers(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, cursor: "pointer" }} onClick={handleShowDislikers} title="Beğenmeyenleri gör">
        <FaThumbsDown style={{ color: "#a21caf", fontSize: "1.15rem" }} />
        <span style={{ fontWeight: 600, color: "#222", fontSize: "1.05rem" }}>{count}</span>
      </div>
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#fff", borderRadius: 12, minWidth: 280, maxWidth: 340, maxHeight: 400, overflowY: "auto", boxShadow: "0 4px 24px rgba(0,0,0,0.13)", padding: 20 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: "1.13rem", marginBottom: 12, color: "#a21caf", textAlign: "center" }}>Beğenmeyenler</div>
            {loadingDislikers ? (
              <div style={{ textAlign: "center", color: "#888", fontSize: 15 }}>Yükleniyor...</div>
            ) : dislikers.length === 0 ? (
              <div style={{ textAlign: "center", color: "#888", fontSize: 15 }}>Henüz kimse beğenmemiş.</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {dislikers.map(user => (
                  <li key={user.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #f3f3f3", cursor: "pointer" }}>
                    <Link to={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit', width: '100%' }}>
                      {user.profilePhotoUrl ? (
                        <img src={`http://localhost:5000${user.profilePhotoUrl}`} alt={user.userName} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "#a21caf", fontSize: 17 }}>{user.userName?.[0]?.toUpperCase() || "K"}</div>
                      )}
                      <span style={{ fontWeight: 500, color: "#222", fontSize: 15 }}>@{user.userName || user.fullName || "Kullanıcı"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowModal(false)} style={{ marginTop: 16, width: "100%", background: "#a21caf", color: "#fff", border: "none", borderRadius: 7, padding: "7px 0", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Kapat</button>
          </div>
        </div>
      )}
    </>
  );
};

export default DislikeCount; 